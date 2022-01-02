import Mock from "mockjs";
import "@/mock/extend";

const user = Mock.mock({
  username: "Jason",
  userId: "用户标识",
  realname: "真实姓名",
  certificateId: "身份证号",
  phone: "手机号码",
  memberLevel: "会员级别, normal/vip",
  region: "注册地区",
  introduction: "用户简介",
});

Mock.mock(
  `${process.env.VUE_APP_API_BASE_URL}/auth/login`,
  // "/api/auth/login",
  "post",
  ({ body }) => {
    let result = { data: {} };
    const { username, password } = JSON.parse(body);

    let success = false;

    if (username === "admin" && password === "888888") {
      success = true;
    } else {
      success = false;
    }

    if (success) {
      result.code = 0;
      result.msg = Mock.mock("@TIMEFIX").CN + "，欢迎回来";
      result.data.user = user;
      result.data.token = "Authorization:" + Math.random();
      // result.data.expireAt = new Date(new Date().getTime() + 30 * 60 * 1000);
    } else {
      result.code = -1;
      result.message = "账户名或密码错误（admin/888888 or test/888888）";
    }
    return result;
  }
);

Mock.mock(
  `${process.env.VUE_APP_API_BASE_URL}/user/request/list`,
  "get",
  () => {
    let result = { data: {} };
    let dataSource = [];
    for (let i = 0; i < 100; i++) {
      dataSource.push({
        id: "333",
        key: i,
        title: "NO " + i,
        typeId: 1,
        desc: "这是一段描述",
        num: 1,
        state: "待响应",
        dueDate: "2018-07-26",
        responses: [
          {
            id: "111",
            user: {
              id: "111",
              username: "qwerq",
            },
            desc: "123131231123",
          },
          {
            id: "222",
            user: {
              id: "333",
              username: "qwerq",
            },
            desc: "12313123123123",
          },
        ],
      });
    }

    result.code = 0;
    result.msg = Mock.mock("@TIMEFIX").CN + "，欢迎回来";
    result.data.requests = dataSource;

    // console.log(body)
    //  let result = { data: {} };
    //   success = false;
    // }

    // if (success) {
    //   esult.code = 0;
    //   result.msg = Mock.mock("@TIMEFIX").CN + "，欢迎回来";
    //   result.data.user = user;
    //   result.data.token = "Authorization:" + Math.random();
    //   // result.data.expireAt = new Date(new Date().getTime() + 30 * 60 * 1000);
    // } else {
    //   result.code = -1;
    //   result.message = "账户名或密码错误（admin/888888 or test/888888）";
    // }
    return result;
  }
);
