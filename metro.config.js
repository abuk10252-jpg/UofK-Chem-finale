// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');
const { FileStore } = require('metro-cache');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Use a stable on-disk store (shared across web/android)
const root = process.env.METRO_CACHE_ROOT || path.join(__dirname, '.metro-cache');
config.cacheStores = [
  new FileStore({ root: path.join(root, 'cache') }),
];

// Only watch the essential project directories, not the whole workspace
config.watchFolders = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'src'),
  path.join(__dirname, 'assets'),
  path.join(__dirname, 'node_modules'),
];

// Exclude unnecessary directories from file watching to avoid ENOSPC
config.resolver.blockList = [
  /[/\\]\.cache[/\\].*/,
  /[/\\]\.metro-cache[/\\].*/,
  /[/\\]\.git[/\\].*/,
  /[/\\]\.local[/\\].*/,
  /node_modules[/\\]react-native[/\\]ReactAndroid[/\\].*/,
  /node_modules[/\\].*[/\\](android|ios|windows|macos)[/\\].*/,
];

// Reduce the number of workers to decrease resource usage
config.maxWorkers = 2;

module.exports = config;
