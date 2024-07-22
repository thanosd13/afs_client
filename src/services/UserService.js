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

  logout() {
    localStorage.removeItem("token");
  }
}

export default new UserService();
