import React, { useEffect, useState } from "react";
import {
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CPagination,
  CPaginationItem,
} from "@coreui/react";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FaCheck } from "react-icons/fa";
import "./Users.css";
import UserService from "../../services/UserService";
import AcceptModal from "../../components/modals/AcceptModal";
import DeleteModal from "../../components/modals/DeleteModal";
import EditUserModal from "../../components/modals/EditUserModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [itemsPerPage] = useState(5); // Items per page
  const [acceptVisible, setAcceptVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = () => {
      UserService.fetchUsers()
        .then((response) => {
          if (response.status === 200) {
            setUsers(response.data.data);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    };
    fetchUsers();
  }, []);

  // Calculate the total number of pages
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // Calculate the index range for the current page
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const handleAcceptClick = (userId) => {
    setSelectedUserId(userId);
    setAcceptVisible(true);
  };

  const acceptUser = () => {
    if (selectedUserId !== null) {
      UserService.approveUser(selectedUserId)
        .then((response) => {
          if (response.status === 200) {
            setUsers(
              users.map((user) =>
                user.id === selectedUserId ? { ...user, role: "user" } : user
              )
            );
            setAcceptVisible(false);
            toast.success("Η αποδοχή του χρήστη ολοκληρώθηκε με επιτυχία!");
          }
        })
        .catch((error) => {
          console.log("Error accepting user:", error);
          toast.error("Σφάλμα: Η αποδοχή του χρήστη απέτυχε.");
        });
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      UserService.deleteUser(selectedUser.id)
        .then((response) => {
          if (response.status === 200) {
            setUsers(users.filter((user) => user.id !== selectedUser.id));
            setDeleteVisible(false);
            toast.success("Ο χρήστης διαγράφηκε με επιτυχία!");
          }
        })
        .catch((error) => {
          console.log("Error deleting user:", error);
          toast.error("Σφάλμα: Η διαγραφή του χρήστη απέτυχε.");
        });
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditVisible(true);
  };

  const handleSaveEdit = (updatedUser) => {
    UserService.editUser(updatedUser.id, updatedUser)
      .then((response) => {
        if (response.status === 200) {
          setUsers(
            users.map((user) =>
              user.id === updatedUser.id ? updatedUser : user
            )
          );
          setEditVisible(false);
          toast.success("Ο χρήστης ενημερώθηκε με επιτυχία!");
        }
      })
      .catch((error) => {
        console.log("Error updating user:", error);
        toast.error("Σφάλμα: Η ενημέρωση του χρήστη απέτυχε.");
      });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="users">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="users-table">
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>Χρήστες</CCardHeader>
            <CCardBody>
              <div className="table-responsive">
                <CTable>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell scope="col">id</CTableHeaderCell>
                      <CTableHeaderCell scope="col">
                        Όνομα χρήστη
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col">E-mail</CTableHeaderCell>
                      <CTableHeaderCell scope="col">ΑΦΜ</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Κατάσταση</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Ενέργειες</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentUsers
                      .filter((user) => user.role !== "admin")
                      .map((user) => (
                        <CTableRow key={user.id}>
                          <CTableHeaderCell scope="row">
                            {user.id}
                          </CTableHeaderCell>
                          <CTableDataCell>{user.username}</CTableDataCell>
                          <CTableDataCell>{user.email}</CTableDataCell>
                          <CTableDataCell>{user.afm}</CTableDataCell>
                          <CTableDataCell>
                            {user.role === "pending"
                              ? "Σε εκρεμότητα"
                              : user.role === "user"
                                ? "Επιβεβαιωμένος χρήστης"
                                : user.role}
                          </CTableDataCell>
                          <CTableDataCell className="actions">
                            {user.role !== "user" && (
                              <button
                                className="accept-btn"
                                onClick={() => handleAcceptClick(user.id)}
                              >
                                <FaCheck />
                              </button>
                            )}
                            <button
                              className="edit-btn"
                              onClick={() => handleEditClick(user)}
                            >
                              <MdOutlineEdit />
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteClick(user)}
                            >
                              <RiDeleteBin5Line />
                            </button>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                  </CTableBody>
                </CTable>
              </div>
              <div className="pagination">
                <CPagination className="mt-3">
                  <CPaginationItem
                    aria-label="Previous"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
                    }
                  >
                    &laquo;
                  </CPaginationItem>
                  {[...Array(totalPages)].map((_, index) => (
                    <CPaginationItem
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem
                    aria-label="Next"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prevPage) =>
                        Math.min(prevPage + 1, totalPages)
                      )
                    }
                  >
                    &raquo;
                  </CPaginationItem>
                </CPagination>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </div>
      <AcceptModal
        visible={acceptVisible}
        setVisible={setAcceptVisible}
        acceptUser={acceptUser}
      />
      <DeleteModal
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        onConfirm={handleDeleteConfirm}
        username={selectedUser?.username}
      />
      <EditUserModal
        visible={editVisible}
        setVisible={setEditVisible}
        user={selectedUser}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default Users;
