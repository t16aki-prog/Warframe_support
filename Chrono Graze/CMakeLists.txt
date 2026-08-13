cmake_minimum_required(VERSION 3.11)

# CMake 4.x compatibility policies for FetchContent and older libraries (Raylib)
set(CMAKE_POLICY_VERSION_MINIMUM 3.5)
if(POLICY CMP0135)
    cmake_policy(SET CMP0135 NEW)
endif()

project(ChronoGraze)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Fetch raylib
include(FetchContent)
FetchContent_Declare(
    raylib
    URL https://github.com/raysan5/raylib/archive/refs/tags/5.0.tar.gz
)
set(BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(BUILD_GAMES OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(raylib)

# Add our executable
add_executable(${PROJECT_NAME} 
    src/main.cpp
    src/Player.cpp
    src/JustDodgeSystem.cpp
    src/UpgradeSystem.cpp
    src/Enemy.cpp
)

# Link against raylib
target_link_libraries(${PROJECT_NAME} PRIVATE raylib)

# Include directories
target_include_directories(${PROJECT_NAME} PRIVATE src)
