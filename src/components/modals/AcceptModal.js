import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
} from "@coreui/react";

const AcceptModal = ({ visible, setVisible, acceptUser }) => {
  return (
    <CModal
      visible={visible}
      onClose={() => setVisible(false)}
      aria-labelledby="LiveDemoExampleLabel"
    >
      <CModalHeader>
        <CModalTitle id="LiveDemoExampleLabel">Αποδοχή χρήστη</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>Είστε βέβαιος ότι θέλετε να αποδεχτείτε το συγκεκριμένο χρήστη;</p>
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
          onClick={acceptUser}
        >
          Αποδοχή
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AcceptModal;
