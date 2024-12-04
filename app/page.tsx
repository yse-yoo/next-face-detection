'use client'

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const HomePage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    };

    loadModels();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setImageUrl(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleImageLoad = async () => {
    if (imageUrl && canvasRef.current) {
      setLoading(true);
      const img = document.getElementById('uploaded-image') as HTMLImageElement;
      const detections = await faceapi.detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();

      const displaySize = { width: img.width, height: img.height };
      faceapi.matchDimensions(canvasRef.current, displaySize);

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Face Detection</h1>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      {loading && <p>Loading...</p>}
      {imageUrl && (
        <div>
          <img id="uploaded-image" src={imageUrl} alt="Uploaded" onLoad={handleImageLoad} />
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
};

export default HomePage;