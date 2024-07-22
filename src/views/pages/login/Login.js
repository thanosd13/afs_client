import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { CgDanger } from "react-icons/cg";
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from "@coreui/react";
import "./Login.css";
import UserService from "../../../services/UserService";
import logo from "../../../assets/afs_images/afs_logo.png";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const submit = () => {
    if (!formData.username || !formData.password) {
      setAlertMessage("Συμπληρώστε τα πεδία");
      return;
    }
    UserService.login(formData)
      .then((response) => {
        if (response.status === 200) {
          setAlertMessage("");
          navigate("/charts");
          localStorage.setItem("token", response.data.data.token);
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          setAlertMessage("Εισάγατε λάθος στοιχεία!");
          setFormData((prevState) => ({
            ...prevState,
            username: "",
            password: "",
          }));
        } else {
          setAlertMessage("Κάποιο σφάλμα προέκυψε!");
          setFormData((prevState) => ({
            ...prevState,
            username: "",
            password: "",
          }));
        }
      });
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={5}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
                    {alertMessage && (
                      <CAlert className="alert-danger" color="danger">
                        <CgDanger />
                        {alertMessage}
                      </CAlert>
                    )}
                    <div className="text-center mb-4 logo">
                      <img src={logo} alt="Logo" style={{ width: "150px" }} />
                    </div>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <FaRegUser />
                      </CInputGroupText>
                      <CFormInput
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Όνομα χρήστη"
                        autoComplete="username"
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <RiLockPasswordLine />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Κωδικός πρόσβασης"
                        autoComplete="current-password"
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={7}>
                        <CButton
                          onClick={submit}
                          color="primary"
                          className="px-4 login_btn"
                        >
                          Σύνδεση
                        </CButton>
                      </CCol>
                      <CCol xs={5} className="text-right">
                        <Link to="/register">
                          <CButton color="link" className="px-0 link_register">
                            Δεν έχετε λογαριασμό;
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;
