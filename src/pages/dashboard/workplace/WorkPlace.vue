<template>
  <page-layout :avatar="currUser.avatar">
    <div slot="headerContent">
      <div class="title">你好，{{ currUser.username }}。</div>
      <!-- <div>{{currUser.position[lang]}}</div> -->
      <a-descriptions>
        <a-descriptions-item label="用户名">{{
          currUser.username
        }}</a-descriptions-item>
        <a-descriptions-item label="用户姓名">{{
          currUser.realname
        }}</a-descriptions-item>
        <a-descriptions-item label="身份证号">{{
          currUser.certificateId
        }}</a-descriptions-item>
        <a-descriptions-item label="手机号码">{{
          currUser.phone
        }}</a-descriptions-item>
        <a-descriptions-item label="用户级别">{{
          currUser.memberLevel
        }}</a-descriptions-item>
        <a-descriptions-item label="注册地区">{{
          currUser.region
        }}</a-descriptions-item>
        <a-descriptions-item label="用户简介">{{
          currUser.introduction === null || currUser.introduction === ""
            ? "这个用户很懒，什么都没有写。"
            : currUser.introduction
        }}</a-descriptions-item>
      </a-descriptions>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { mapState } from "vuex";
import { request, METHOD } from "@/utils/request";
import { INFO } from "@/services/api";
import { mapMutations } from "vuex";

export default {
  name: "WorkPlace",
  inject: ["reload"],
  components: { PageLayout },
  i18n: require("./i18n"),
  data() {
    return {
      projects: [],
      loading: true,
      activities: [],
      teams: [],
      welcome: {
        timeFix: "",
        message: "",
      },
      visible: false,
      visiblePass: false,
      form: this.$form.createForm(this),
    };
  },
  computed: {
    ...mapState("account", { currUser: "user" }),
    ...mapState("setting", ["lang"]),
  },
  created() {
    request(INFO, METHOD.GET).then((res) => {
      const data = res.data;
      if (data.code === 0) {
        const user = data.data;
        this.setUser(user);
        this.$message.success(data.message, 3);
      } else {
        this.$message.warn(data.message);
      }
      return res;
    });
    console.log(this.currUser);
  },
  methods: {
    ...mapMutations("account", ["setUser", "setPermissions", "setRoles"]),
  },
};
</script>

<style lang="less">
@import "index";
</style>
