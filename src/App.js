// 1. Install dependencies DONE
// 2. Import dependencies DONE
// 3. Setup webcam and canvas DONE
// 4. Define references to those DONE
// 5. Load handpose DONE
// 6. Detect function DONE
// 7. Drawing utilities DONE
// 8. Draw functions DONE
import React, { useRef } from "react";
// import logo from './logo.svg';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { Component } from "react";
import { drawHand, pred, det } from "./utilities";
import { render } from "react-dom";
var webcamRef;
var canvasRef;
var hand;
var arr = ["rock", "paper", "scissor"];

const runHandpose = async () => {
  const net = await handpose.load();
  console.log("Handpose model loaded.");
  //  Loop and detect hands
  setInterval(() => {
    detect(net);
  }, 100);
};
class App extends React.Component {
  yscore = 0;
  cscore = 0;
  draw = 0;
  round = 0;
  you = 0;
  interval = 0;
  constructor(props) {
    
    super(props);
    this.state = {
      userScore:0, 
      botScore:0, 
      userChoice:0, 
      draw:0,
      boolValue:true,
      currentValue:null,
      computer :"rock"
    }
    this.outerFuncLoop = this.outerFuncLoop.bind(this);
    this.innerFunc = this.innerFunc.bind(this);
    webcamRef = React.createRef(null);
    canvasRef = React.createRef(null)
    runHandpose();
  }
  
  render() {
    console.log(arr.indexOf("rock")*2+1,this.state);
    
    return (
      <div className="App ">
        <div style={{ boxShadow: "0px -10px 50px  lightgray" }}>
          <header className="App-eader d-flex ">
            <div className=" p-4 col-4 d-block mx-auto text-center">
              ROUND {this.round}
            </div>
          </header>
          
        </div>
        <div className=" col-sm-11 col-md-10 mt-5 pb-5 col-lg-9 d-flex mx-auto  flex-wrap justify-content-around" >
        <div className="justify-content-between row  col-12">
            <div className="p-4 col-4 d-flex flex-wrap"style={{boxShadow:"0px 5px 30px lightgray",borderRadius:30}}>
              <span className="text-secondary col-12">SCORE</span>
              <span className="col-12">{this.state.userScore}</span>
              <div
          className="frame col-12 d-flex mt-3 "
          style={{ position: "relative",alignItems: "center",minHeight:1 }}
        >
          <Webcam
            id="webcam"
            ref={webcamRef} className="col-12 "
            style={{ position: "absolute", zindex: 0,left:0,height:"100%"}}
          ></Webcam>
          <canvas
            ref={canvasRef} className="col-12"
            style={{ position: "relative", zindex: 20,left:0,width:"100%"}}
          />
        </div>
            </div>
            <div className="p-4 col-3 d-flex flex-column justify-center flex-wrap">
              <span className="text-secondary col-12">Draw</span>
              <span className="col-12">{this.state.draw}</span>
              <span className="d-block my-md-3 my-lg-5" style={{ fontSize: 20 }}>
              Get Ready
            </span>
            
            <button
              name="formBtn"
              id="playbtn"
              className={!this.state.boolValue ? "d-none":"mt-5 btn btn-success px-sm-2 px-lg-4"} 
              onClick={this.onstart.bind(this)}
            >
              Play
            </button>
            <button
              name="formBtn"
              id="playbtn"
              className={this.state.boolValue ? "d-none":"mt-5 btn btn-danger px-sm-2 px-lg-4"} 
              onClick={this.stop.bind(this)}
            >
              Stop
            </button>
            </div>
            <div className="p-4 col-4 d-flex justify-center flex-column"style={{boxShadow:"0px 5px 30px lightgray",borderRadius:30}}>
              <span className="text-secondary col-12">SCORE</span>
              <span className="col-12">{this.state.botScore}</span>
              <img src={require("./"+Number(arr.indexOf(this.state.computer)*2+1)+".png")}/> 
              <div className="mt-5">{this.state.computer.toUpperCase()}</div>
            </div>
          </div>
        </div>

        
       
      </div>
    );
  }
  game(you) {
    this.state.computer = this.com();
    this.round++;
    console.log("c" + this.state.computer);
    console.log("y" + you);
    var r = this.check(you, this.state.computer);
    console.log(r);
    if (r == -1) {
      this.setState({draw:this.state.draw+1})
      ;
    } else if (r == 0) {
      this.setState({botScore:this.state.botScore+1})
    } else if (r == 1) {
      this.setState({userScore:this.state.userScore +1});
    }
  }
  com() {
    
    return arr[Math.floor(Math.random() * arr.length)];
  }
  check(you, computer) {
    if (you == computer) return -1;

    if (you == "rock" && computer == "paper") return 0;
    else if (you == "paper" && computer == "rock") return 1;

    if (you == "rock" && computer == "scissor") return 1;
    else if (you == "scissor" && computer == "rock") return 0;

    if (you == "paper" && computer == "scissor") return 0;
    else if (you == "scissor" && computer == "paper") return 1;
  }
  async outerFuncLoop (){
    
      console.log("Ready");
      setTimeout(this.innerFunc, 3000);
    
  }
innerFunc() {
  this.you = det(hand);
  console.log(this.you)
  this.setState({currentValue:this.you})
  if (this.you == "stop"||this.state.boolValue) {
    console.log("stoped")
    this.stop();
    clearInterval(this.interval);
  } else {
    this.game(this.you);
  }

}
onstart() {
    this.setState({boolValue: false })
    console.log(this.state.boolValue)
    this.interval = setInterval(this.outerFuncLoop, 10000);
  }
stop() {
  this.setState({boolValue:true})
  }
}

const detect = async (net) => {
  // Check data is available
  if (
    typeof webcamRef.current !== "undefined" &&
    webcamRef.current !== null &&
    webcamRef.current.video.readyState === 4
  )
  {
    // Get Video Properties
    const video = webcamRef.current.video;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set video width
    webcamRef.current.video.width = videoWidth;
    webcamRef.current.video.height = videoHeight;

    // Set canvas height and width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    // Make Detections
    hand = await net.estimateHands(video);

    // Draw mesh
    const ctx = canvasRef.current.getContext("2d");
    drawHand(hand, ctx);
    pred(hand, ctx);
  }
};
export default App;