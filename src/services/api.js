//跨域代理前缀
const API_PROXY_PREFIX='/api'
const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.VUE_APP_API_BASE_URL : API_PROXY_PREFIX
// const BASE_URL = process.env.VUE_APP_API_BASE_URL;
module.exports = {
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  INFO: `${BASE_URL}/user/info`,
  EDIT: `${BASE_URL}/user/edit`,
  EDIT_PASS: `${BASE_URL}/user/editpass`,
  REQ_ADD: `${BASE_URL}/user/request/add`,
  REQ_LIST: `${BASE_URL}/user/request/list`,
  REQ_REPLY: `${BASE_URL}/user/request/reply`,
  REQ_DEL: `${BASE_URL}/user/request/del`,
  REQ_IMG: `${BASE_URL}/user/img`,
  RES_REQ_LIST: `${BASE_URL}/user/response/req`,
  RES_LIST: `${BASE_URL}/user/response/list`,
  RES_ADD: `${BASE_URL}/user/response/add`,
  RES_DEL: `${BASE_URL}/user/response/del`,
  ROUTES: `${BASE_URL}/routes`,
  GOODS: `${BASE_URL}/goods`,
  GOODS_COLUMNS: `${BASE_URL}/columns`,
};

