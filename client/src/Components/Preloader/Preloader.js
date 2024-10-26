import React from "react";
import loadingGif from '../../assets/images/loading.gif'; // Ensure the path is correct

const Preloader = () => {
    const preloaderStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999999,
        transition: "opacity 0.6s",
    };

    const imgStyle = {
        maxHeight: "100px",
    };

    return (
        <div id="preloader-active" style={preloaderStyle}>
            <div className="preloader-inner position-relative">
                <div className="text-center">
                    <img src={loadingGif} alt="Loading..." style={imgStyle} />
                </div>
            </div>
        </div>
    );
};

export default Preloader;
