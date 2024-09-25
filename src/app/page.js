"use client";

import Webcam from "react-webcam";
import * as cocoModel from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { useEffect, useRef, useState, useCallback } from "react";

export default function Page() {
    const webcamRef = useRef(null); // Reference to the Webcam component
    const [model, setModel] = useState(null);
    const [objects, setObjects] = useState([]); // Array to store detected objects

    // Load the COCO-SSD model
    const loadModel = useCallback(async () => {
        try {
            const loadedModel = await cocoModel.load();
            setModel(loadedModel);
        } catch (error) {
            console.error("Error loading model:", error);
        }
    }, []);

    // Function to detect objects in the video feed
    const detectObjects = useCallback(async () => {
        if (
            model &&
            webcamRef.current &&
            webcamRef.current.video.readyState === 4
        ) {
            const video = webcamRef.current.video;
            const detections = await model.detect(video);
            setObjects(detections); // Update detected objects state
        }
        requestAnimationFrame(detectObjects); // Request next frame for detection
    }, [model]);

    // Load the model and start detecting objects on component mount
    useEffect(() => {
        tf.ready().then(() => {
            loadModel();
        });
    }, [loadModel]);

    // Start object detection when the model is loaded
    useEffect(() => {
        if (model) {
            detectObjects();
        }
    }, [model, detectObjects]);

    const videoOptions = {
        width: 720,
        height: 480,
        facingMode: "environment",
    };

    return (
        <div className={"container mx-auto h-screen bg-blue-900 p-8 flex flex-col gap-10"}>
            <h1 className={"font-bold text-4xl"}>Real-Time Object Detection</h1>
            <Webcam
                ref={webcamRef}
                audio={false}
                videoConstraints={videoOptions}
                id="videoSource"
                style={{ width: "75%", height: "auto" }}
            />
            {objects.length > 0 && (
                <div>
                    {objects.map((object, index) => (
                        <div key={index}>
                            <h3>Object: {object.class}</h3>
                            <h3>Score: {(object.score * 100).toFixed(2)}%</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
