import React from "react";
import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
} from "@coreui/react";

const NotificationModal = ({ visible, message, onClose }) => {
  return (
    <CModal
      visible={visible}
      onClose={onClose}
      aria-labelledby="NotificationModal"
    >
      <CModalHeader>
        <CModalTitle id="NotificationModal">Ενημέρωση</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>{message}</p>
      </CModalBody>
      <CModalFooter>
        <CButton style={{ color: "#FFFFFF" }} color="danger" onClick={onClose}>
          Κλείσιμο
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default NotificationModal;
