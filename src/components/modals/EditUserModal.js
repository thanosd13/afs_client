import React, { useState, useEffect } from "react";
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
} from "@coreui/react";

const EditUserModal = ({ visible, setVisible, user, onSave }) => {
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [afm, setAfm] = useState(user?.afm || "");

  useEffect(() => {
    // Update the form fields when the user prop changes
    setUsername(user?.username || "");
    setEmail(user?.email || "");
    setAfm(user?.afm || "");
  }, [user]);

  const handleSave = () => {
    // Validate and save changes
    const updatedUser = {
      ...user,
      username,
      email,
      afm,
    };
    onSave(updatedUser);
  };

  return (
    <CModal visible={visible} onClose={() => setVisible(false)}>
      <CModalHeader>
        <CModalTitle id="LiveDemoExampleLabel">Επεξεργασία χρήστη</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <div className="form-group">
            <CFormLabel htmlFor="username">Username</CFormLabel>
            <CFormInput
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <CFormLabel htmlFor="email">Email</CFormLabel>
            <CFormInput
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <CFormLabel htmlFor="afm">AFM</CFormLabel>
            <CFormInput
              type="text"
              id="afm"
              value={afm}
              onChange={(e) => setAfm(e.target.value)}
            />
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton
          style={{ color: "#FFFFFF" }}
          color="danger"
          onClick={() => setVisible(false)}
        >
          Κλείσιμο
        </CButton>
        <CButton
          style={{ color: "#FFFFFF" }}
          color="success"
          onClick={handleSave}
        >
          Αποθήκευση
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default EditUserModal;
