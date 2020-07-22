# Visualizing Air Quality In Ulaanbaatar

The .gitignore file contains all the directories that will NOT be tracked in git because they can be generated locally.
 - After pulling the remote repository, make sure to run 'npm install' to update/fetch the latest modules.

## Create png frames from a set of air quality tiff rasters
node -r esm createPNGFromTIFFs.js;

Afterwards can use quicktime/some other video tool to compile frames into a video file.