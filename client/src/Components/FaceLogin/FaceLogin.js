import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import { Button, CircularProgress, Box } from '@mui/material';
import Swal from 'sweetalert2';
import './FaceLogin.css';

const FaceLogin = ({ onFaceDetected, mode = 'login' }) => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isCameraActive, setIsCameraActive] = useState(false);
	const [modelsLoaded, setModelsLoaded] = useState(false);
	const [detectionProgress, setDetectionProgress] = useState(0);
	const [faceDetected, setFaceDetected] = useState(false);

	useEffect(() => {
		const setupFaceDetection = async () => {
			try {
				setIsLoading(true);
				console.log('Setting up face detection...');

				await tf.setBackend('cpu');
				await tf.ready();
				console.log('TensorFlow.js initialized with CPU backend');

				const MODEL_URL = `${window.location.origin}/models`;
				
				// Improved detection options
				faceapi.env.monkeyPatch({
					Canvas: HTMLCanvasElement,
					Image: HTMLImageElement,
					ImageData: ImageData,
					Video: HTMLVideoElement,
					createCanvasElement: () => document.createElement('canvas'),
					createImageElement: () => document.createElement('img')
				});

				try {
					await Promise.all([
						faceapi.nets.tinyFaceDetector.load(MODEL_URL),
						faceapi.nets.faceLandmark68Net.load(MODEL_URL),
						faceapi.nets.faceRecognitionNet.load(MODEL_URL)
					]);
					
					console.log('All models loaded successfully');
					setModelsLoaded(true);
					setIsLoading(false);
				} catch (modelError) {
					throw new Error(`Failed to load models: ${modelError.message}`);
				}
			} catch (error) {
				console.error('Error setting up face detection:', error);
				setIsLoading(false);
				Swal.fire({
					title: 'Error',
					text: `Failed to initialize face detection: ${error.message}`,
					icon: 'error',
					confirmButtonText: 'Retry',
				}).then((result) => {
					if (result.isConfirmed) {
						setupFaceDetection();
					}
				});
			}
		};

		setupFaceDetection();
		return () => stopVideo();
	}, []);

	const startVideo = async () => {
		if (!modelsLoaded) {
			Swal.fire({
				title: 'Please Wait',
				text: 'Face detection models are still loading...',
				icon: 'info'
			});
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: 640,
					height: 480,
					facingMode: 'user',
					frameRate: { ideal: 30 }
				}
			});
			
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				setIsCameraActive(true);
				setDetectionProgress(0);
				setFaceDetected(false);
			}
		} catch (error) {
			console.error('Error accessing camera:', error);
			Swal.fire({
				title: 'Camera Access Denied',
				text: 'Please allow camera access to use Face ID login',
				icon: 'error'
			});
		}
	};

	const stopVideo = () => {
		if (videoRef.current && videoRef.current.srcObject) {
			const tracks = videoRef.current.srcObject.getTracks();
			tracks.forEach(track => track.stop());
			videoRef.current.srcObject = null;
			setIsCameraActive(false);
			setDetectionProgress(0);
			setFaceDetected(false);
		}
	};

	const detectFace = async () => {
		if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

		const video = videoRef.current;
		const canvas = canvasRef.current;

		// Set canvas dimensions to match video
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		let detectionCount = 0;
		const requiredDetections = 10; // Number of successful detections needed

		const detectInterval = setInterval(async () => {
			if (!isCameraActive) {
				clearInterval(detectInterval);
				return;
			}

			try {
				const detections = await faceapi
					.detectAllFaces(
						video, 
						new faceapi.TinyFaceDetectorOptions({
							inputSize: 416,
							scoreThreshold: 0.5
						})
					)
					.withFaceLandmarks()
					.withFaceDescriptors();

				const ctx = canvas.getContext('2d');
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				if (detections.length === 1) {
					setFaceDetected(true);
					detectionCount++;
					setDetectionProgress((detectionCount / requiredDetections) * 100);

					// Draw face detection box and landmarks
					faceapi.draw.drawDetections(canvas, detections);
					faceapi.draw.drawFaceLandmarks(canvas, detections);

					if (detectionCount >= requiredDetections) {
						clearInterval(detectInterval);
						const faceDescriptor = Array.from(detections[0].descriptor);
						stopVideo();
						onFaceDetected(faceDescriptor);
					}
				} else {
					setFaceDetected(false);
				}
			} catch (error) {
				console.error('Error during face detection:', error);
				clearInterval(detectInterval);
				Swal.fire({
					title: 'Detection Error',
					text: 'Face detection failed. Please try again.',
					icon: 'error'
				});
			}
		}, 100);
	};

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.addEventListener('play', detectFace);
		}
		return () => {
			if (videoRef.current) {
				videoRef.current.removeEventListener('play', detectFace);
			}
			stopVideo();
		};
	}, [videoRef.current, modelsLoaded]);

	if (isLoading) {
		return (
			<Box className="face-login-loading">
				<CircularProgress size={60} thickness={4} />
				<p>Initializing Face Detection...</p>
			</Box>
		);
	}

	return (
		<Box className="face-login-container">
			<div className="video-wrapper">
				<video
					ref={videoRef}
					autoPlay
					muted
					playsInline
					className={`face-video ${faceDetected ? 'face-detected' : ''}`}
				/>
				<canvas ref={canvasRef} className="face-canvas" />
				
				{isCameraActive && (
					<div className="face-overlay">
						<div className="face-frame">
							{detectionProgress > 0 && (
								<Box className="detection-progress">
									<CircularProgress
										variant="determinate"
										value={detectionProgress}
										size={100}
										thickness={2}
										className="progress-circle"
									/>
									<span className="progress-text">{Math.round(detectionProgress)}%</span>
								</Box>
							)}
						</div>
					</div>
				)}
			</div>
			
			{!isCameraActive && (
				<Button 
					variant="contained" 
					color="primary" 
					onClick={startVideo}
					id="startFaceIdLogin"
					className="start-camera-btn"
					disabled={!modelsLoaded}
				>
					{mode === 'login' ? 'Start Face ID Login' : 'Register Face ID'}
				</Button>
			)}
			
			{isCameraActive && (
				<Box className="face-instructions">
					<p>{faceDetected ? 'Face Detected! Please hold still...' : 'Position your face in the frame'}</p>
				</Box>
			)}
		</Box>
	);
};

export default FaceLogin; 