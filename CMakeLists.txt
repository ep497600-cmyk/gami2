cmake_minimum_required(VERSION 3.18.1)
project("wifimonster")

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ये 4 फाइलें आपस में बात करेंगी
add_library(wifimonster SHARED
    wifimonster.cpp      # मेन फाइल - सब कुछ इसमें है
)

find_library(log-lib log)
find_library(android-lib android)

target_link_libraries(wifimonster
    ${log-lib}
    ${android-lib}
)

target_compile_options(wifimonster PRIVATE
    -O3 -ffast-math -Wall
)