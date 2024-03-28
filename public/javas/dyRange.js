// credit to:https://jeromewu.github.io/ffmpeg-wasm-a-pure-webassembly-javascript-port-of-ffmpeg/ for FFmpeg wasm

// instances the ffmpeg
const { fetchFile, toBlobURL } = FFmpegUtil;
const { FFmpeg } = FFmpegWASM;

let ffmpeg = new FFmpeg();

var wheel = document.getElementById("loading");
var text = document.getElementById("loadingText");

// gets file from user and initiates ubuffer array + loading wheel variable
const myFile = document.getElementById("myFile");

myFile.onchange = async () => {
    wheel.style.display = "block";
    text.style.display = "flex";

    var ubuffer = [];

    const fileData = myFile.files[0];
    const fileSize = myFile.size;
    let estTime;
    if (fileSize < 500073111) {
        estTime = "under 5 minutes";
    } else if (fileSize > 500073111 && fileSize < 1000073111) {
        estTime = "around 10 minutes";
    } else if (fileSize > 1000073111) {
        estTime = "10 - 20 minutes";
    }

    text.textContent =
        "Modifying the audio of your movie file. Est time : " + estTime;

    let vidFile = await fetchFile(myFile.files[0]);

    console.log(vidFile);

    (async () => {
        try {
            const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
            await ffmpeg.load({
                coreURL: await toBlobURL(
                    `${baseURL}/ffmpeg-core.js`,
                    "text/javascript"
                ),
                wasmURL: await toBlobURL(
                    `${baseURL}/ffmpeg-core.wasm`,
                    "application/wasm"
                ),
            });

            await ffmpeg.writeFile(`${fileData.name}`, vidFile);
            await ffmpeg.exec([
                "-i",
                `${fileData.name}`,
                "-vcodec",
                "copy",
                "-af",
                "compand=0|0:1|1:-90/-900|-70/-70|-30/-9|0/-3:6:0:0:0",
                `soundsqueezd_${fileData.name}`,
            ]);
        } catch (err) {
            alert("Something went wrong, make sure you're using google chrome");
            console.log(err);
        }

        try {
            // reads file to const output (still in array form), and then converted to blob
            const output = await ffmpeg.readFile(
                `soundsqueezd_${fileData.name}`
            );
            const outputBlob = new Blob([output], { type: "video/mp4" });

            // Create object URL to get movie blob from memory, and make available for download
            const objUrl = URL.createObjectURL(outputBlob);
            wheel.style.display = "none";
            text.textContent = "Done!";

            let uploadButton =
                document.getElementsByClassName("custom-file-upload")[0];
            uploadButton.style.display = "none";

            let middleDiv = document.getElementsByClassName("formDiv")[0];

            var a = window.document.createElement("a");
            a.href = objUrl;
            a.download = `soundsqueezd_${fileData.name}`;
            a.className = "getFileButton";
            a.textContent = "Get File";

            // Append anchor to body.
            middleDiv.appendChild(a);
        } catch (err) {
            alert(
                "Problem with outputting file. Make sure file is a movie file! Page will reload upon closing this box"
            );
            console.log(err);
        }
    })();
};
