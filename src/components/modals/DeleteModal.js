import React from "react";
import {
  CModal,
  CModalTitle,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
} from "@coreui/react";

const DeleteModal = ({ visible, setVisible, onConfirm, username }) => {
  return (
    <CModal visible={visible} onClose={() => setVisible(false)}>
      <CModalHeader>
        <CModalTitle id="LiveDemoExampleLabel">Διαγραφή χρήστη</CModalTitle>
      </CModalHeader>
      <CModalBody>
        Είστε σίγουρος ότι θέλετε να διαγράψετε το χρήστη με όνομα χρήστη:{" "}
        <strong>{username}</strong>?
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setVisible(false)}>
          Κλείσιμο
        </CButton>
        <CButton
          style={{ color: "#FFFFFF" }}
          color="danger"
          onClick={onConfirm}
        >
          Διαγραφή
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default DeleteModal;
