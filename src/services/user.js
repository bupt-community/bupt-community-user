import { LOGIN, REGISTER, EDIT, ROUTES } from "@/services/api";
import { request, METHOD, removeAuthorization } from "@/utils/request";

/**
 * 登录服务
 * @param name 账户名
 * @param password 账户密码
 * @returns {Promise<AxiosResponse<T>>}
 */
export async function login(username, password) {
  return request(LOGIN, METHOD.POST, {
    username: username,
    password: password,
  });
}

export async function register(
  username,
  password,
  certificateId,
  realname,
  phone
) {
  return request(REGISTER, METHOD.POST, {
    username,
    password,
    certificateId,
    realname,
    phone,
  });
}

export async function edit(phone, introduction) {
  return request(EDIT, METHOD.POST, {
    phone,
    introduction,
  });
}

export async function getRoutesConfig() {
  return request(ROUTES, METHOD.GET);
}

/**
 * 退出登录
 */
export function logout() {
  sessionStorage.removeItem(process.env.VUE_APP_ROUTES_KEY);
  sessionStorage.removeItem(process.env.VUE_APP_PERMISSIONS_KEY);
  sessionStorage.removeItem(process.env.VUE_APP_ROLES_KEY);
  removeAuthorization();
}
export default {
  login,
  logout,
  getRoutesConfig,
};
