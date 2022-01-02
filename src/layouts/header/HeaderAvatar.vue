<template>
  <div>
    <a-modal
      title="编辑用户"
      :visible="visible"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form @submit="handleOk" :form="form">
        <a-form-item>
          <a-input
            autocomplete="autocomplete"
            size="large"
            placeholder="手机号码"
            type="text"
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
            autocomplete="autocomplete"
            size="large"
            placeholder="用户简介"
            type="text"
            v-decorator="[
              'introduction',
              {
                rules: [
                  {
                    required: true,
                    message: '请输入用户简介',
                    whitespace: true,
                  },
                ],
              },
            ]"
          >
            <a-icon slot="prefix" type="user" />
          </a-input>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal
      title="修改密码"
      :visible="visiblePass"
      @ok="handleOkPass"
      @cancel="handleCancelPass"
    >
      <a-form @submit="handleOkPass" :form="form">
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
          </a-input> </a-form-item
      ></a-form>
    </a-modal>
    <a-dropdown>
      <div class="header-avatar" style="cursor: pointer">
        <!-- <a-avatar class="avatar" size="small" shape="circle" :src="user.avatar"/> -->
        <span class="name">{{ user.username }}</span>
      </div>
      <a-menu :class="['avatar-menu']" slot="overlay">
        <a-menu-item @click="openEdit">
          <a-icon style="margin-right: 8px" type="poweroff" />
          <span>编辑用户</span>
        </a-menu-item>
        <a-menu-item @click="openPass">
          <a-icon style="margin-right: 8px" type="poweroff" />
          <span>修改密码</span>
        </a-menu-item>
        <a-menu-item @click="logout">
          <a-icon style="margin-right: 8px" type="poweroff" />
          <span>退出登录</span>
        </a-menu-item>
      </a-menu>
    </a-dropdown>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import { logout } from "@/services/user";
import { edit } from "@/services/user";
import { request, METHOD } from "@/utils/request";
import { EDIT_PASS } from "@/services/api";

export default {
  name: "HeaderAvatar",
  inject: ["reload"],
  data() {
    return {
      form: this.$form.createForm(this),
      visible: false,
      visiblePass: false,
    };
  },
  computed: {
    ...mapGetters("account", ["user"]),
    ...mapState("account", { currUser: "user" }),
  },
  methods: {
    logout() {
      logout();
      this.$router.push("/login");
    },
    openEdit() {
      this.visible = true;
      this.$nextTick(() => {
        this.form.setFieldsValue({
          phone: this.currUser.phone,
          introduction: this.currUser.introduction,
        });
      });
    },
    openPass() {
      this.visiblePass = true;
    },
    handleOk(e) {
      this.confirmLoading = true;

      e.preventDefault();
      this.form.validateFields((err) => {
        if (!err) {
          const phone = this.form.getFieldValue("phone");
          const introduction = this.form.getFieldValue("introduction");
          // const password = this.form.getFieldValue("password");
          edit(phone, introduction).then((res) => {
            this.logging = false;
            const loginRes = res.data;
            if (loginRes.code === 0) {
              this.$message.info(loginRes.message);
              this.reload();
            } else {
              this.$message.warn(loginRes.message);
            }
          });
        }
      });
    },
    handleCancel() {
      console.log("Clicked cancel button");
      this.visible = false;
    },
    handleOkPass(e) {
      this.confirmLoading = true;

      e.preventDefault();
      this.form.validateFields((err) => {
        if (!err) {
          let password = this.form.getFieldValue("password");
          console.log(password);
          request(EDIT_PASS, METHOD.POST, { password }).then((res) => {
            this.logging = false;
            const data = res.data;
            if (data.code === 0) {
              this.$message.info(data.message);
              this.reload();
            } else {
              this.$message.warn(data.message);
            }
          });
          // const password = this.form.getFieldValue("password");
          // edit(phone, introduction).then((res) => {
          //   this.logging = false;
          //   const loginRes = res.data;
          //   if (loginRes.code === 0) {
          //     this.reload();
          //   } else {
          //     this.$message.warn(loginRes.message, loginRes.data);
          //   }
          // });
        }
      });
    },
    handleCancelPass() {
      console.log("Clicked cancel button");
      this.visiblePass = false;
    },
  },
};
</script>

<style lang="less">
.header-avatar {
  display: inline-flex;
  .avatar,
  .name {
    align-self: center;
  }
  .avatar {
    margin-right: 8px;
  }
  .name {
    font-weight: 500;
  }
}
.avatar-menu {
  width: 150px;
}
</style>
