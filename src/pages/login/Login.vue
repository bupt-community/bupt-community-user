<template>
  <common-layout>
    <div class="top">
      <div class="header">
        <img alt="logo" class="logo" src="@/assets/img/logo.png" />
        <span class="title">{{ systemName }}</span>
      </div>
      <div class="desc">太好逛了吧</div>
    </div>
    <div class="login">
      <a-form @submit="onSubmit" :form="form">
        <a-tabs
          size="large"
          :tabBarStyle="{ textAlign: 'center' }"
          style="padding: 0 2px"
          @change="changeTab"
        >
          <a-tab-pane tab="登录" key="1">
            <a-alert
              type="error"
              :closable="true"
              v-show="error"
              :message="error"
              showIcon
              style="margin-bottom: 24px"
            />
            <a-form-item>
              <a-input
                autocomplete="autocomplete"
                size="large"
                placeholder="用户名"
                v-decorator="[
                  'username',
                  {
                    rules: [
                      {
                        required: true,
                        message: '请输入用户名',
                        whitespace: true,
                      },
                    ],
                  },
                ]"
              >
                <a-icon slot="prefix" type="user" />
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-input
                size="large"
                placeholder="密码"
                autocomplete="autocomplete"
                type="password"
                v-decorator="[
                  'password',
                  {
                    rules: [
                      {
                        required: true,
                        message: '请输入密码',
                        whitespace: true,
                      },
                    ],
                  },
                ]"
              >
                <a-icon slot="prefix" type="lock" />
              </a-input>
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="注册" key="2">
            <a-form-item>
              <a-input
                autocomplete="autocomplete"
                size="large"
                placeholder="用户名"
                v-decorator="[
                  'username',
                  {
                    rules: [
                      {
                        required: true,
                        message: '请输入用户名',
                        whitespace: true,
                      },
                    ],
                  },
                ]"
              >
                <a-icon slot="prefix" type="user" />
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-input
                autocomplete="autocomplete"
                size="large"
                placeholder="用户姓名"
                v-decorator="[
                  'realname',
                  {
                    rules: [
                      {
                        required: true,
                        message: '请输入用户姓名',
                        whitespace: true,
                      },
                    ],
                  },
                ]"
              >
                <a-icon slot="prefix" type="user" />
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-input
                autocomplete="autocomplete"
                size="large"
                placeholder="身份证号码"
                v-decorator="[
                  'certificateId',
                  {
                    rules: [
                      {
                        required: true,
                        message: '请输入身份证号码',
                        whitespace: true,
                      },
                    ],
                  },
                ]"
              >
                <a-icon slot="prefix" type="user" />
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-input
                autocomplete="autocomplete"
                size="large"
                placeholder="手机号码"
                v-decorator="[
                  'phone',
                  {
                    rules: [
                      {
                        required: true,
                        message: '请输入手机号码',
                        whitespace: true,
                      },
                    ],
                  },
                ]"
              >
                <a-icon slot="prefix" type="user" />
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-input
                size="large"
                placeholder="密码"
                autocomplete="autocomplete"
                type="password"
                v-decorator="[
                  'password',
                  {
                    rules: [
                      {
                        required: true,
                        message: '请输入密码',
                        whitespace: true,
                      },
                    ],
                  },
                ]"
              >
                <a-icon slot="prefix" type="lock" />
              </a-input>
            </a-form-item>
          </a-tab-pane>
        </a-tabs>
        <a-form-item>
          <a-button
            :loading="logging"
            style="width: 100%; margin-top: 24px"
            size="large"
            htmlType="submit"
            type="primary"
            >登录</a-button
          >
        </a-form-item>
      </a-form>
    </div>
  </common-layout>
</template>

<script>
import CommonLayout from "@/layouts/CommonLayout";
import { login, register } from "@/services/user";
import { setAuthorization } from "@/utils/request";
import { mapMutations } from "vuex";

export default {
  name: "Login",
  inject: ["reload"],
  components: { CommonLayout },
  data() {
    return {
      logging: false,
      error: "",
      form: this.$form.createForm(this),
      currIdx: 1,
    };
  },
  computed: {
    systemName() {
      return this.$store.state.setting.systemName;
    },
  },
  methods: {
    ...mapMutations("account", ["setUser", "setPermissions", "setRoles"]),
    // tab
    changeTab(key) {
      this.currIdx = key;
    },
    onSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err) => {
        if (!err) {
          this.logging = true;
          const username = this.form.getFieldValue("username");
          const password = this.form.getFieldValue("password");
          if (this.currIdx != 1) {
            const certificateId = this.form.getFieldValue("certificateId");

            if (certificateId.length < 6) {
              this.$message.warn("身份证号格式不正确");
              this.reload();
            } else {
              const realname = this.form.getFieldValue("realname");
              const phone = this.form.getFieldValue("phone");
              register(username, password, certificateId, realname, phone).then(
                this.afterRegister
              );
            }
          } else {
            login(username, password).then(this.afterLogin);
          }
        }
      });
    },
    afterLogin(res) {
      this.logging = false;
      const loginRes = res.data;
      if (loginRes.code === 0) {
        setAuthorization({
          token: loginRes.data,
        });
        this.$router.push("/dashboard");
        this.$message.success(loginRes.message, 3);
      } else {
        this.error = loginRes.message;
      }
      return res;
    },
    afterRegister(res) {
      this.logging = false;
      const data = res.data;
      if (data.code === 0) {
        this.$message.success(data.message, 3);
      } else {
        this.$message.warn(data.message);
      }
      this.reload();
    },
  },
};
</script>

<style lang="less" scoped>
.common-layout {
  .top {
    text-align: center;
    .header {
      height: 44px;
      line-height: 44px;
      a {
        text-decoration: none;
      }
      .logo {
        height: 44px;
        vertical-align: top;
        margin-right: 16px;
      }
      .title {
        font-size: 33px;
        color: @title-color;
        font-family: "Myriad Pro", "Helvetica Neue", Arial, Helvetica,
          sans-serif;
        font-weight: 600;
        position: relative;
        top: 2px;
      }
    }
    .desc {
      font-size: 14px;
      color: @text-color-second;
      margin-top: 12px;
      margin-bottom: 40px;
    }
  }
  .login {
    width: 368px;
    margin: 0 auto;
    @media screen and (max-width: 576px) {
      width: 95%;
    }
    @media screen and (max-width: 320px) {
      .captcha-button {
        font-size: 14px;
      }
    }
    .icon {
      font-size: 24px;
      color: @text-color-second;
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: @primary-color;
      }
    }
  }
}
</style>
