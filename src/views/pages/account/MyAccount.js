import React, { useEffect, useState } from "react";
import { CgDanger } from "react-icons/cg";
import { FaRegCheckCircle } from "react-icons/fa";
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
} from "@coreui/react";
import UserService from "../../../services/UserService";

const MyAccount = () => {
  const id = localStorage.getItem("id");
  const [userData, setUserData] = useState([]);
  const [alertDanger, setAlertDanger] = useState("");
  const [alertSuccess, setAlertSuccess] = useState("");
  useEffect(() => {
    UserService.getUserData(id)
      .then((response) => {
        if (response.status === 200) {
          setUserData(response.data.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const updateUser = () => {
    UserService.updateUser(id, userData)
      .then((response) => {
        if (response.status === 200) {
          setAlertSuccess("Επιτυχής αποθήκευση!");
        }
      })
      .catch((error) => {
        setAlertDanger("Κάποιο πρόβλημα προέκυψε!");
      });
  };
  return (
    <CRow>
      <CCol xs={12}>
        {alertSuccess && (
          <CAlert
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
            color="success"
          >
            <FaRegCheckCircle />
            {alertSuccess}
          </CAlert>
        )}
        {alertDanger && (
          <CAlert
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
            color="danger"
          >
            <CgDanger />
            {alertDanger}
          </CAlert>
        )}
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Ο Λογαριασμός μου</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <div className="mb-3">
                <CFormLabel
                  style={{ fontWeight: "bold" }}
                  htmlFor="exampleFormControlInput1"
                >
                  Όνομα χρήστη
                </CFormLabel>
                <CFormInput
                  name="username"
                  onChange={handleChange}
                  value={userData.username}
                  type="text"
                  placeholder="όνομα χρήστη"
                />
              </div>
              <div className="mb-3">
                <CFormLabel
                  style={{ fontWeight: "bold" }}
                  htmlFor="exampleFormControlInput1"
                >
                  Email
                </CFormLabel>
                <CFormInput
                  name="email"
                  onChange={handleChange}
                  value={userData.email}
                  type="email"
                  placeholder="e-mail"
                />
              </div>
              <div className="mb-3">
                <CFormLabel
                  style={{ fontWeight: "bold" }}
                  s
                  htmlFor="exampleFormControlInput1"
                >
                  Όνομα χρήστη ΑΑΔΕ
                </CFormLabel>
                <CFormInput
                  name="username_aade"
                  onChange={handleChange}
                  value={userData.username_aade}
                  type="text"
                  placeholder="όνομα χρήστη ΑΑΔΕ"
                />
              </div>
              <div className="mb-3">
                <CFormLabel
                  style={{ fontWeight: "bold" }}
                  htmlFor="exampleFormControlInput1"
                >
                  Subscription key ΑΑΔΕ
                </CFormLabel>
                <CFormInput
                  name="subscription_key_aade"
                  onChange={handleChange}
                  value={userData.subscription_key_aade}
                  type="text"
                  placeholder="subscription key ΑΑΔΕ"
                />
              </div>
              <div>
                <CButton
                  onClick={updateUser}
                  style={{ color: "white" }}
                  color="success"
                >
                  Αποθήκευση
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default MyAccount;
