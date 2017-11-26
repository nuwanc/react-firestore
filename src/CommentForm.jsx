import React, { Component } from "react";
import { db, storage } from "./firestore";
import firebase from "firebase";

class CommentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      rating: "1",
      text: "",
      file: null
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleFileChange(event) {
    let file = event.target.files[0];
    this.setState({
      file: file
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    let that = this;
    let comment = {
      name: this.state.name,
      rating: this.state.rating,
      text: this.state.text
    };
    let uploader = document.getElementById("uploader");
    let commentRef = db.collection("comments").doc();

    let file = this.state.file;
    if (file !== null) {
      let extention = file.name.split('.').pop();

      let storageRef = storage.ref("avatars/" + commentRef.id + "." + extention);
      let uploadTask = storageRef.put(file);
      // Register three observers:
      // 1. 'state_changed' observer, called any time the state changes
      // 2. Error observer, called on failure
      // 3. Completion observer, called on successful completion
      uploadTask.on(
        "state_changed",
        function(snapshot) {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          let progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
          console.log("Upload is " + progress + "% done");
          uploader.value = progress;

          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log("Upload is paused");
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log("Upload is running");
              break;
          }
        },
        function(error) {
          // Handle unsuccessful uploads
        },
        function() {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          let downloadURL = uploadTask.snapshot.downloadURL;
          //let commentRef = db.collection("comments").doc();

          comment.avatar = downloadURL;
          commentRef.set(comment);
          that.setState(() => {
            return {
              name: "",
              rating: "1",
              text: "",
              file: null
            };
          });
          that.props.onSubmit();
        }
      );
    } else {
      //let commentRef = db.collection("comments").doc();
      comment.avatar = "";
      commentRef.set(comment);
      this.setState(() => {
        return {
          name: "",
          rating: "1",
          text: "",
          file: null
        };
      });
      this.props.onSubmit();
    }
  }

  render() {
    return (
      <form
        className="column"
        onSubmit={this.handleSubmit}
        style={this.props.hidden ? { display: "none" } : null}
      >
        <label htmlFor="name">Name</label>
        <input
          id="name"
          placeholder="Name"
          type="text"
          autoComplete="off"
          name="name"
          value={this.state.name}
          onChange={this.handleInputChange}
        />
        <label htmlFor="rating">Rating</label>
        <span>
          <label>
            <input
              type="radio"
              name="rating"
              value="1"
              defaultChecked={this.state.rating === "1"}
              onClick={this.handleInputChange}
            />{" "}
            1
          </label>
          <label>
            <input
              type="radio"
              name="rating"
              value="2"
              defaultChecked={this.state.rating === "2"}
              onClick={this.handleInputChange}
            />{" "}
            2
          </label>
          <label>
            <input
              type="radio"
              name="rating"
              value="3"
              defaultChecked={this.state.rating === "3"}
              onClick={this.handleInputChange}
            />{" "}
            3
          </label>
          <label>
            <input
              type="radio"
              name="rating"
              value="4"
              defaultChecked={this.state.rating === "4"}
              onClick={this.handleInputChange}
            />{" "}
            4
          </label>
          <label>
            <input
              type="radio"
              name="rating"
              value="5"
              defaultChecked={this.state.rating === "5"}
              onClick={this.handleInputChange}
            />{" "}
            5
          </label>
        </span>
        <label htmlFor="text">Comment</label>
        <textarea
          id="text"
          placeholder="text"
          autoComplete="off"
          name="text"
          value={this.state.text}
          onChange={this.handleInputChange}
        />
        <progress value="0" max="100" id="uploader">
          0%
        </progress>
        <label htmlFor="avatarImage">Choose an image file to upload</label>
        <input
          type="file"
          id="avatarImage"
          name="avatarImage"
          accept=".jpg, .jpeg, .png"
          onChange={this.handleFileChange}
        />
        <button className="button" type="submit" disabled={!this.state.name}>
          Submit
        </button>
      </form>
    );
  }
}

export default CommentForm;
