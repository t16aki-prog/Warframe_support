const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// uploads ディレクトリの作成
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// multer 設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// APIキーの確認
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environmental variables.");
}

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;
  const originalName = req.file.originalname;

  console.log(`Received file: ${originalName} (${mimeType})`);

  if (!process.env.GEMINI_API_KEY) {
    // APIキーがない場合の一時ファイルの削除
    fs.unlinkSync(filePath);
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server. Please set it in server/.env file.' });
  }

  let uploadResult;
  const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

  try {
    // 1. Gemini File API へアップロード
    console.log('Uploading file to Gemini API...');
    uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: mimeType,
      displayName: originalName,
    });
    console.log(`File uploaded. Name: ${uploadResult.file.name}`);

    // 2. 処理完了を待つ (動画などの場合)
    let fileState = await fileManager.getFile(uploadResult.file.name);
    while (fileState.state === 'PROCESSING') {
      console.log('Gemini is processing the file, waiting 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      fileState = await fileManager.getFile(uploadResult.file.name);
    }

    if (fileState.state === 'FAILED') {
      throw new Error('Gemini file processing failed.');
    }
    console.log('File is ready for model consumption.');

    // 3. コンテンツ生成 (モデルの呼び出し)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // 動画/音声をサポートする 1.5-flash を使用
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const prompt = `
以下の指示に従って、提供されたマルチメディアコンテンツ（動画または音声）の著作権および肖像権の侵害リスクを詳細に分析してください。

【分析の観点】
1. 著作権侵害リスク:
   - 市販の楽曲、他者のラジオ・テレビ番組、アニメ・映画などの音声がバックグラウンドやメインで無断利用されていないか。
   - 他者の著作物（書籍、詩、他人の記事など）をそのまま読み上げている箇所がないか。
   - 映像内に、特定の商標、ロゴ、アニメーションキャラクター、アート作品などが許諾なく大きく映り込んでいないか。
   - 引用とみなせる場合であっても、それが「主従関係」や「必然性」を満たしているか。
2. 肖像権・プライバシー侵害リスク:
   - 公共の場所やプライベートな場所で、一般人の顔や容貌がモザイクやぼかし処理なく、個人が特定できるレベルで映り込んでいる箇所はないか。

【出力フォーマット】
以下のJSON構造のみを出力してください。余計なマークダウンのバックティックスや「json」といった文字列は不要です（純粋なJSONテキストのみを返してください）。

{
  "summary": "動画全体の解析結果の要約（日本語）",
  "overallRiskLevel": "HIGH" | "MEDIUM" | "LOW",
  "copyrightRisks": [
    {
      "timestamp": "MM:SS",
      "seconds": 123,
      "riskLevel": "HIGH" | "MEDIUM" | "LOW",
      "description": "リスクの詳細説明（何が映っているか、または聞こえるか）",
      "legalBasis": "関連する著作権法の条文や法的根拠の解説（例: 複製権・公衆送信権の侵害の恐れ、引用の要件不足など）",
      "solution": "具体的な改善策（例: 差し替え、ミュート、ぼかし加工など）"
    }
  ],
  "portraitRisks": [
    {
      "timestamp": "MM:SS",
      "seconds": 45,
      "riskLevel": "HIGH" | "MEDIUM" | "LOW",
      "description": "リスクの詳細説明（誰がどのように映っているか）",
      "legalBasis": "肖像権およびプライバシー権に関する法的根拠（受忍限度論など）",
      "solution": "具体的な改善策（例: モザイク処理、トリミングなど）"
    }
  ]
}
`;

    console.log('Sending request to Gemini model...');
    const result = await model.generateContent([
      uploadResult.file,
      { text: prompt }
    ]);

    const responseText = result.response.text();
    console.log('Analysis completed.');

    // JSONとして解析できるか試す
    try {
      const jsonResponse = JSON.parse(responseText);
      res.json(jsonResponse);
    } catch (e) {
      console.error('Failed to parse JSON response from Gemini:', responseText);
      res.status(500).json({
        error: 'AI returned invalid JSON format.',
        rawText: responseText
      });
    }

  } catch (error) {
    console.error('Error during analysis:', error);
    res.status(500).json({ error: error.message || 'An error occurred during analysis.' });
  } finally {
    // 4. クリーンアップ (ローカルの一時ファイル削除とGemini File APIからの削除)
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('Local temporary file deleted.');
      } catch (err) {
        console.error('Failed to delete local file:', err);
      }
    }
    if (uploadResult && uploadResult.file) {
      try {
        await fileManager.deleteFile(uploadResult.file.name);
        console.log('Gemini remote file deleted.');
      } catch (err) {
        console.error('Failed to delete Gemini remote file:', err);
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
