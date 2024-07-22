import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoKeyOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
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
import "./Register.css";
import logo from "../../../assets/afs_images/afs_logo.png";
import UserService from "../../../services/UserService";

const Register = () => {
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    usernameAade: "",
    subscriptionKey: "",
    repeatPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const submit = () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.usernameAade ||
      !formData.subscriptionKey ||
      !formData.password ||
      !formData.repeatPassword
    ) {
      setAlertMessage("Συμπληρώστε όλα τα πεδία!");
      return;
    }
    if (formData.password !== formData.repeatPassword) {
      setAlertMessage("Οι κωδικοί πρόσβασης δεν ταιριάζουν!");
      return;
    }
    UserService.register(formData)
      .then((response) => {
        if (response.status === 201) {
          localStorage.setItem("token", response.data.data.token);
          navigate("/charts");
        }
      })
      .catch((error) => {
        if (error.response.status === 409) {
          setAlertMessage("Το Email ή το Όνομα χρήστη χρησιμοποιείται ήδη");
        } else {
          setAlertMessage("Κάποιο σφάλμα προέκυψε!");
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
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <MdAlternateEmail />
                      </CInputGroupText>
                      <CFormInput
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        autoComplete="email"
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <FaRegUser />
                      </CInputGroupText>
                      <CFormInput
                        name="usernameAade"
                        value={formData.usernameAade}
                        onChange={handleChange}
                        placeholder="Όνομα χρήστη ΑΑΔΕ"
                        autoComplete="username"
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <IoKeyOutline />
                      </CInputGroupText>
                      <CFormInput
                        name="subscriptionKey"
                        value={formData.subscriptionKey}
                        onChange={handleChange}
                        placeholder="Subscription key ΑΑΔΕ"
                        autoComplete="username"
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <RiLockPasswordLine />
                      </CInputGroupText>
                      <CFormInput
                        name="password"
                        value={formData.password}
                        type="password"
                        onChange={handleChange}
                        placeholder="Κωδικός πρόσβασης"
                        autoComplete="current-password"
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <RiLockPasswordLine />
                      </CInputGroupText>
                      <CFormInput
                        name="repeatPassword"
                        value={formData.repeatPassword}
                        type="password"
                        onChange={handleChange}
                        placeholder="Επανάληψη κωδικού πρόσβασης"
                        autoComplete="current-password"
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={7}>
                        <CButton
                          onClick={submit}
                          color="primary"
                          className="px-4 register_btn"
                        >
                          Εγγραφή
                        </CButton>
                      </CCol>
                      <CCol xs={5} className="text-right">
                        <Link to="/login">
                          <CButton color="link" className="px-0 link_login">
                            Έχετε ήδη λογαριασμό;
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

export default Register;
