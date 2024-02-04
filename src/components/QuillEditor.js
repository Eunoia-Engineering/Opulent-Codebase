import React, { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import "firebase/compat/firestore";
import firebase from "firebase/compat/app";
import firebaseConfig from "./firebaseConfig";

const QuillEditor = () => {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentSlug, setDocumentSlug] = useState("");

  useEffect(() => {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    if (editorRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
          ],
        },
      });
    }
  }, []);

  const saveToFirebase = async () => {
    const content = quillInstance.current?.root.innerHTML;
    const userID = firebase.auth().currentUser.uid;

    if (content && documentTitle.trim() && documentSlug !== "") {
      const db = firebase.firestore();
      const user = firebase.auth().currentUser;

      if (user) {
        const displayName = user.displayName || "Anonymous";
        const currentDate = new Date().toLocaleDateString();

        const editorContentRef = db.collection("editorContent").doc();

        await editorContentRef
          .set({
            userID,
            author: displayName,
            documentTitle,
            documentSlug,
            content,
            date: currentDate,
          });

        console.log("Content saved to Firebase successfully");
        window.location.href = "/home";
      } else {
        console.warn("User not logged in. Content not saved.");
      }
    } else {
      console.warn("Content or document title is empty. Nothing to save.");
      window.confirm("Content or document title is empty. Please provide a title, URL slug, and content for your page.");
    }
  };

  return (
    <div>
      <input
        type="text"
        className="form-control"
        placeholder="Document Title"
        aria-label="Document Title"
        value={documentTitle}
        onChange={(e) => setDocumentTitle(e.target.value)}
      />
      <input
        type="text"
        className="form-control"
        placeholder="Slug-URL   (ex. how-to-cook-pasta)"
        aria-label="Slug (URL)"
        value={documentSlug}
        onChange={(e) => setDocumentSlug(e.target.value)}
      />
      <div ref={editorRef} />
      <button
        className="btn btn-light btn-sm"
        style={{ marginTop: "2%", backgroundColor: "#0064e0", color: "white" }}
        onClick={saveToFirebase}
      >
        Save to Firebase
      </button>
      <a
        className="btn btn-light btn-sm"
        style={{ marginTop: "2%", backgroundColor: "#0064e0", color: "white" }}
        href="/home"
      >
        Go Home
      </a>
    </div>
  );
};

export default QuillEditor;
