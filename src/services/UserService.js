import axios from "axios";
import { MIDDLEWARE_ULR } from "../config/constant";
import AuthHeader from "./AuthHeader";

const API_URL = MIDDLEWARE_ULR;

class UserService {
  register(formData) {
    return axios.post(API_URL + "/user/register", formData);
  }

  login(formData) {
    return axios
      .post(API_URL + "/user/login", { formData })
      .then((response) => {
        if (response.data) {
          localStorage.setItem(
            "id",
            JSON.stringify(response.data.data.user.id)
          );
          localStorage.setItem("token", JSON.stringify(response.data.token));
        }

        return { data: response.data, status: response.status };
      });
  }

  getUserData(id) {
    return axios.get(API_URL + "/user/getUserData/" + id, {
      headers: AuthHeader(),
    });
  }

  updateUser(id, userData) {
    return axios.put(API_URL + "/user/updateUserData/" + id, userData, {
      headers: AuthHeader(),
    });
  }

  requestIncome(id) {
    return axios.get(API_URL + "/user/requestIncome/" + id, {
      headers: AuthHeader(),
    });
  }

  requestExpenses(id) {
    return axios.get(API_URL + "/user/requestExpenses/" + id, {
      headers: AuthHeader(),
    });
  }

  requestIncomeWithDates(id, dateFrom, dateTo) {
    return axios.post(
      API_URL + "/user/requestIncomeWithDates/" + id,
      {
        dateFrom,
        dateTo,
      },
      {
        headers: AuthHeader(),
      }
    );
  }

  requestExpensesWithDates(id, dateFrom, dateTo) {
    return axios.post(
      API_URL + "/user/requestExpensesWithDates/" + id,
      {
        dateFrom,
        dateTo,
      },
      {
        headers: AuthHeader(),
      }
    );
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
  }
}

export default new UserService();
