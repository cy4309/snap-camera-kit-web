import { useCallback, useEffect, useRef, useState } from "react";
import { useCameraKit } from "./hooks/useCameraKit";
import { createMediaStreamSource, Transform2D } from "@snap/camera-kit";
import BaseButton from "./components/BaseButton";

function App() {
  const { session, lenses } = useCameraKit();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [currentLensIndex, setCurrentLensIndex] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  // const [videoDataUrl, setVideoDataUrl] = useState<string | null>(null);

  const startCameraKit = useCallback(async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      // video: true,
      // video: { width: { ideal: 1280 } },
      // video: { width: { ideal: 3840 }, height: { ideal: 2160 } },
      video: {
        // width: { ideal: 720 }, // mobile
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: facingMode,
      },
    });

    const source = createMediaStreamSource(mediaStream, {
      transform: facingMode === "user" ? Transform2D.MirrorX : undefined,
    });

    session.setSource(source);
    // session.applyLens(lenses[0]);
    session.play("live");
  }, [session, lenses, facingMode]);

  useEffect(() => {
    startCameraKit();
  }, [startCameraKit]);

  useEffect(() => {
    canvasContainerRef?.current?.replaceWith(session.output.live);
  }, [session]);

  useEffect(() => {
    if (session && lenses.length > 0) {
      // console.log(lenses);
      session.applyLens(lenses[currentLensIndex]);
    }
  }, [session, lenses, currentLensIndex]);

  // 錄影結束時自動清除計時器
  useEffect(() => {
    if (!recording && recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  }, [recording]);

  // 時間格式化
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isLineWebView = () => {
    return /Line/i.test(navigator.userAgent);
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // const toggleAudio = () => {
  //   setIsAudioEnabled((prev) => !prev);
  // };

  const takePhoto = () => {
    if (!canvasRef.current || !session.output.live) return;

    // 取得 live DOM 的寬高
    const live = session.output.live as HTMLVideoElement | HTMLCanvasElement;
    const width =
      live instanceof HTMLVideoElement ? live.videoWidth : live.width;
    const height =
      live instanceof HTMLVideoElement ? live.videoHeight : live.height;

    // 設定 canvas 尺寸
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(live, 0, 0, width, height);

    const imageData = canvasRef.current.toDataURL("image/png");
    setPhoto(imageData);

    // 下載圖片
    const link = document.createElement("a");
    link.href = imageData;
    link.download = "snap-photo.png";
    link.click();
  };

  // 錄影功能
  const startRecording = () => {
    if (!session.output.live) return;
    // 取得 live video stream
    let stream: MediaStream | null = null;
    if (session.output.live instanceof HTMLVideoElement) {
      stream = session.output.live.srcObject as MediaStream;
    } else if (session.output.live.captureStream) {
      stream = session.output.live.captureStream();
    }
    if (!stream) return;

    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/mp4" });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/mp4" });
      setVideoUrl(URL.createObjectURL(blob));

      // 新增：產生 DataURL 給 iOS 用
      // const reader = new FileReader();
      // reader.onloadend = () => {
      //   setVideoDataUrl(reader.result as string); // 新增一個 state
      // };
      // reader.readAsDataURL(blob);
    };

    mediaRecorder.start();
    setRecording(true);
    setVideoUrl(null);
    setRecordingTime(0);
    // 開始計時
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    // 停止計時
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  return (
    <div className="relative w-full h-[100dvh] min-w-[320px] min-h-screen flex flex-col justify-center items-center">
      <div ref={canvasContainerRef} />

      {!photo && !videoUrl && (
        <div className="w-1/2 absolute bottom-30 flex flex-col justify-center items-center">
          {/* <BaseButton onClick={toggleAudio} className="px-4 py-2 opacity-80 font-bold rounded-xl shadow-md">
            {isAudioEnabled ? "🔊" : "🔇"}
          </BaseButton> */}
          <canvas ref={canvasRef} className="hidden" />

          <div className="w-full gap-2 flex overflow-x-auto custom-scrollbar">
            {lenses.map((lens, i) => (
              <img
                key={lens.id}
                onClick={() => setCurrentLensIndex(i)}
                src={lens.iconUrl}
                alt={`濾鏡${i + 1}`}
                // className="w-12 cursor-pointer"
                className={`w-12 cursor-pointer rounded-xl ${
                  currentLensIndex === i
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <BaseButton
              onClick={takePhoto}
              className="px-4 py-2 opacity-80 font-bold rounded-xl shadow-md"
            >
              📸
            </BaseButton>
            {!recording ? (
              <BaseButton
                onClick={startRecording}
                className="px-4 py-2 opacity-80 font-bold rounded-xl shadow-md"
              >
                ⏺️
              </BaseButton>
            ) : (
              <div className="flex items-center gap-2">
                <BaseButton
                  onClick={stopRecording}
                  className="px-4 py-2 opacity-80 font-bold rounded-xl shadow-md"
                >
                  ⏹️
                </BaseButton>
                <span className="text-red-500 font-mono font-bold min-w-[48px] text-lg">
                  {formatTime(recordingTime)}
                </span>
              </div>
            )}
            <BaseButton
              onClick={toggleFacingMode}
              className="px-4 py-2 font-bold rounded-xl shadow-md"
            >
              🔄
            </BaseButton>
          </div>
        </div>
      )}

      {/* 預覽照片 */}
      {photo && (
        <div className="fixed inset-0 z-20 bg-black/80 flex flex-col justify-center items-center">
          <img
            src={photo}
            alt="Snapshot"
            className="rounded-xl shadow-md max-w-md"
          />
          <BaseButton
            onClick={() => setPhoto(null)}
            className="w-1/4 absolute bottom-30"
          >
            返回
          </BaseButton>
        </div>
      )}

      {/* 預覽影片 */}
      {videoUrl && (
        <div className="fixed inset-0 z-20 bg-black/80 flex flex-col justify-center items-center">
          <video
            src={videoUrl}
            controls
            className="rounded-xl shadow-md max-w-md"
          />

          <div className="absolute bottom-50 my-4 gap-4 w-1/2 flex justify-center items-center">
            {/* 電腦/Android 下載 */}
            {isLineWebView() ? (
              <div className="text-red-500 font-bold text-center">
                LINE內建瀏覽器不支援下載，請點「在瀏覽器開啟」再下載影片。
              </div>
            ) : (
              <BaseButton className="w-full !bg-blue-500 text-white">
                <a href={videoUrl} download="snap-video.mp4">
                  影片下載
                </a>
              </BaseButton>
            )}
            {/* iOS 下載（DataURL） */}
            {/* {videoDataUrl && (
              <BaseButton className="w-full !bg-blue-500 text-white">
                <a href={videoDataUrl} download="snap-video.mp4">
                  iOS 下載
                </a>
              </BaseButton>
            )} */}
          </div>

          <BaseButton
            onClick={() => {
              setVideoUrl(null);
              // setVideoDataUrl(null);
            }}
            className="w-1/4 absolute bottom-30"
          >
            返回
          </BaseButton>
        </div>
      )}
    </div>
  );
}

export default App;
