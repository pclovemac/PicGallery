import ffmpeg from 'ffmpeg-static';
import { execSync } from 'child_process';
execSync(`${ffmpeg} -f lavfi -i testsrc=duration=5:size=640x360:rate=30 -c:v libx264 -pix_fmt yuv420p d:/GitHub/PicGallery/photos/test_video.mp4 -y`, {stdio: 'inherit'});
