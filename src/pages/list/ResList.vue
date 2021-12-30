<template>
  <a-card>
    <div>
      <a-modal
        title="我可以"
        :visible="visible"
        @ok="handleOk"
        @cancel="handleCancel"
      >
        <a-form @submit="handleOk" :form="form">
          <a-form-item
            label="响应描述"
            :labelCol="{ span: 5 }"
            :wrapperCol="{ span: 18, offset: 1 }"
          >
            <a-textarea
              rows="4"
              :placeholder="'请输入响应描述'"
              v-decorator="[
                'resDesc',
                { rules: [{ required: true, message: '请输入响应描述' }] },
              ]"
            />
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
    <div>
      <standard-table
        :columns="columns"
        :dataSource="searchResult"
        @clear="onClear"
        @change="onChange"
      >
        <div slot="action" slot-scope="{ record }">
          <a
            @click="showModal(record.key)"
            style="margin-right: 8px"
            :disabled="record.resState !== '待接受'"
          >
            <a-icon type="edit" />编辑
          </a>
          <a
            @click="handleDelete(record.key)"
            :disabled="record.resState !== '待接受'"
          >
            <a-icon type="delete" />取消
          </a>
        </div>
        <template slot="statusTitle">
          <a-icon @click.native="onStatusTitleClick" type="info-circle" />
        </template>
      </standard-table>
    </div>
  </a-card>
</template>

<script>
import { req_types } from "@/utils/util";
import { request, METHOD } from "@/utils/request";
import { RES_LIST, RES_ADD, RES_DEL } from "@/services/api";

import StandardTable from "@/components/table/StandardTable";
const columns = [
  {
    title: "请求主题",
    dataIndex: "title",
    // scopedSlots: { customRender: 'description' }
  },
  {
    title: "请求类型",
    dataIndex: "type",
    // scopedSlots: { customRender: 'description' }
  },
  {
    title: "请求描述",
    dataIndex: "desc",
    // sorter: true,
    // needTotal: true,
    // customRender: (text) => text + ' 次'
  },
  {
    title: "结束日期",
    dataIndex: "dueDate",
    // sorter: true
  },
  {
    title: "响应描述",
    dataIndex: "resDesc",
    // sorter: true
  },
  {
    title: "响应状态",
    dataIndex: "resState",
  },
  {
    title: "操作",
    scopedSlots: { customRender: "action" },
  },
];

const dataSource = [];

for (let i = 0; i < 100; i++) {
  dataSource.push({
    id: "333",
    key: i,
    title: "NO " + i,
    type: "小时工",
    desc: "这是一段描述",
    num: 1,
    state: "待响应",
    dueDate: "2018-07-26",
    res: "我可以",
  });
}

export default {
  name: "ResQueryList",
  components: { StandardTable },
  inject: ["reload"],
  data() {
    return {
      req_types,
      advanced: true,
      columns: columns,
      dataSource: dataSource,
      searchStr: "",
      searchType: undefined,
      ModalText: "Content of the modal",
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      currReq: null,
    };
  },
  created() {
    request(RES_LIST, METHOD.GET).then((res) => {
      console.log(res);
      this.logging = false;
      const data = res.data;
      if (data.code === 0) {
        this.dataSource = data.data.map((item, index) => {
          item = {
            key: index,
            resId: item.id,
            resDesc: item.desc,
            type: this.req_types[item.request.typeId],
            resState: item.state,
            // imgUrl: item.imgUrl,
            ...item.request,
          };
          item.username = item.user.username;
          delete item.typeId;
          delete item.user;
          return item;
        });
      } else {
        this.$message.warn(data.message);
      }
    });
  },
  computed: {
    searchResult() {
      // console.log(this.searchType)
      return this.dataSource.filter((value) => {
        return (
          (this.searchStr === "" || value.title.match(this.searchStr)) &&
          (this.searchType === undefined || value.type === this.searchType)
        );
      });
    },
    getImgUrl() {
      return this.currReq && this.currReq.imgUrl
        ? this.currReq.imgUrl
        : this.defaultImg;
    },
  },
  methods: {
    // form
    showModal(key) {
      this.visible = true;
      this.currReq = this.dataSource[key];
      if (this.currReq.imgUrl) {
        this.currReq.imgUrl =
          process.env.VUE_APP_API_BASE_URL + "/api" + this.currReq.imgUrl;
      }
      console.log(this.currReq.imgUrl);
      this.$nextTick(() => {
        this.form.setFieldsValue({
          resDesc: this.dataSource[key].resDesc,
        });
      });
    },
    handleOk(e) {
      e.preventDefault();
      this.form.validateFields((err) => {
        if (!err) {
          let requestId = this.currReq.id;
          let id = this.currReq.resId;
          let desc = this.form.getFieldValue("resDesc");
          request(RES_ADD, METHOD.POST, {
            id,
            requestId,
            desc,
          }).then((res) => {
            console.log(res);
            this.logging = false;
            const data = res.data;
            if (data.code === 0) {
              this.$message.info(data.message);
            } else {
              this.$message.warn(data.message);
            }
            this.reload();
          });
        }
      });
    },
    handleCancel(e) {
      console.log(e);
      console.log("Clicked cancel button");
      this.visible = false;
    },

    // delete
    handleDelete(key) {
      let resId = this.dataSource[key].resId;
      request(RES_DEL, METHOD.POST, {
        responseId: resId,
      }).then((res) => {
        console.log(res);
        this.logging = false;
        const data = res.data;
        if (data.code === 0) {
          this.$message.info(data.message);
        } else {
          this.$message.warn(data.message);
        }
        this.reload();
      });
    },
    onClear() {
      this.$message.info("您清空了勾选的所有行");
    },
    onStatusTitleClick() {
      this.$message.info("你点击了状态栏表头");
    },
    onChange() {
      this.$message.info("表格状态改变了");
    },
  },
};
</script>

<style lang="less" scoped>
.search {
  margin-bottom: 54px;
}
.fold {
  width: calc(100% - 216px);
  display: inline-block;
}
.operator {
  margin-bottom: 18px;
}
@media screen and (max-width: 900px) {
  .fold {
    width: 100%;
  }
}
</style>
