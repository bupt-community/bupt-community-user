<template>
  <a-card>
    <a-modal :visible="visible" :footer="null" @cancel="handleCancel">
      <a-card hoverable style="width: 100%">
        <img slot="cover" alt="img" :src="getImgUrl" />
        <a-card-meta>
          <template slot="description">
            <a-descriptions title="请求信息" v-if="currReq !== null">
              <a-descriptions-item label="请求主题">
                {{ currReq.title }}
              </a-descriptions-item>
              <a-descriptions-item label="请求类型">
                {{ currReq.type }}
              </a-descriptions-item>
              <a-descriptions-item label="请求描述">
                {{ currReq.desc }}
              </a-descriptions-item>
              <a-descriptions-item label="请求人数">
                {{ currReq.num }}
              </a-descriptions-item>
              <a-descriptions-item label="结束日期">
                {{ currReq.dueDate }}
              </a-descriptions-item>
            </a-descriptions></template
          >
        </a-card-meta>
      </a-card>
    </a-modal>

    <div :class="advanced ? 'search' : null">
      <a-form layout="horizontal">
        <div :class="advanced ? null : 'fold'">
          <a-row>
            <a-col :md="12" :sm="24">
              <a-form-item
                label="请求主题"
                :labelCol="{ span: 5 }"
                :wrapperCol="{ span: 18, offset: 1 }"
              >
                <a-input placeholder="请输入" v-model="searchStr" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item
                label="请求类型"
                :labelCol="{ span: 5 }"
                :wrapperCol="{ span: 18, offset: 1 }"
              >
                <a-select
                  :placeholder="'请选择请求类型'"
                  v-model="searchType"
                  :allowClear="true"
                >
                  <a-select-option v-for="type in req_types" :key="type">{{
                    type
                  }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </div>
      </a-form>
    </div>
    <div>
      <a-table
        :columns="columns"
        :dataSource="searchResult"
        :customRow="customRow"
      >
        <!-- <div slot="responses" slot-scope="{ record }">
          <a-select
            :placeholder="'响应列表'"
            v-model="selectedRes[record.key]"
            :allowClear="true"
          >
            <a-select-option v-for="res in record.responses" :key="res">{{
              res
            }}</a-select-option>
          </a-select>
        </div> -->
        <a-table
          v-if="record.responses.length > 0"
          slot="expandedRowRender"
          slot-scope="record"
          :columns="innerColumns"
          :data-source="record.responses"
          :pagination="false"
        >
          <div slot="action" slot-scope="record">
            <a
              @click="handleAccept(record.reqKey, record.key)"
              :disabled="
                dataSource[record.reqKey].state !== '待响应' ||
                record.state !== '待接受'
              "
            >
              <a-icon type="delete" />接受
            </a>
            <a
              @click="handleReject(record.reqKey, record.key)"
              :disabled="
                dataSource[record.reqKey].state !== '待响应' ||
                record.state !== '待接受'
              "
            >
              <a-icon type="delete" />拒绝
            </a>
          </div>
        </a-table>
        <div slot="action" slot-scope="record">
          <router-link
            :to="{
              name: '发布请求',
              params: {
                request: dataSource[record.key],
              },
            }"
            :disabled="record.state !== '待响应'"
          >
            >编辑</router-link
          >
          <a
            @click="handleDelete(record.key)"
            :disabled="record.state !== '待响应'"
          >
            <a-icon type="delete" />取消
          </a>
        </div>
      </a-table>
    </div>
  </a-card>
</template>

<script>
import { req_types } from "@/utils/util";
import { request, METHOD } from "@/utils/request";
import { REQ_LIST, REQ_REPLY, REQ_DEL } from "@/services/api";

const columns = [
  {
    title: "请求主题",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "请求类型",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "请求描述",
    dataIndex: "desc",
    key: "desc",
  },
  {
    title: "结束日期",
    dataIndex: "dueDate",
    key: "dueDate",
  },
  {
    title: "请求人数",
    dataIndex: "num",
    key: "num",
  },
  {
    title: "请求状态",
    dataIndex: "state",
    key: "state",
  },
  {
    title: "操作",
    key: "action",
    scopedSlots: { customRender: "action" },
  },
];

const innerColumns = [
  {
    title: "响应用户",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "响应描述",
    dataIndex: "desc",
    key: "desc",
  },
  {
    title: "响应状态",
    dataIndex: "state",
    key: "state",
  },
  {
    title: "操作",
    key: "action",
    scopedSlots: { customRender: "action" },
  },
];

let dataSource = [];
let responseIds = [];
const selectedRes = [];

export default {
  name: "ReqQueryList",
  inject: ["reload"],
  // components: { StandardTable },
  data() {
    return {
      req_types,
      selectedRes,
      responseIds,
      advanced: true,
      columns: columns,
      innerColumns,
      dataSource: dataSource,
      searchStr: "",
      searchType: undefined,
      ModalText: "Content of the modal",
      visible: false,
      confirmLoading: false,
      currReq: null,
      defaultImg: require("@/assets/img/logo.png"),
    };
  },
  created() {
    request(REQ_LIST, METHOD.GET).then((res) => {
      console.log(res);
      this.logging = false;
      const data = res.data;
      if (data.code === 0) {
        this.responseIds = data.data.map((item) => {
          if (item.responses) {
            return item.responses.map((item) => {
              return item.id;
            });
          } else {
            return [];
          }
        });

        this.dataSource = data.data.map((item, index) => {
          item.key = index;
          item.type = this.req_types[item.typeId];
          if (item.imgUrl) {
            item.imgUrl =
              process.env.VUE_APP_API_BASE_URL + "/api" + item.imgUrl;
          }
          if (item.responses) {
            item.responses = item.responses.map((item, i) => {
              return {
                key: i,
                reqKey: index,
                id: item.id,
                state: item.state,
                username: item.user.username,
                desc: item.desc,
              };
            });
          } else {
            item.responses = [];
          }
          return item;
        });
      } else {
        this.error = data.message;
      }
    });
  },
  computed: {
    searchResult() {
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
    // detail
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      console.log(e);
      this.ModalText = "The modal will be closed after two seconds";
      this.confirmLoading = true;
      setTimeout(() => {
        this.visible = false;
        this.confirmLoading = false;
      }, 2000);
    },
    handleCancel(e) {
      console.log(e);
      console.log("Clicked cancel button");
      this.visible = false;
    },
    // acc/rej
    getResId(key) {
      return this.dataSource[key].responses.indexOf(selectedRes[key]);
    },
    // TODO
    handleAccept(reqKey, resKey) {
      console.log(reqKey, resKey);
      let reqId = this.dataSource[reqKey].id;
      let resId = this.dataSource[reqKey].responses[resKey].id;
      console.log(resId);
      request(REQ_REPLY, METHOD.POST, {
        requestId: reqId,
        responseId: resId,
        accept: 1,
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
    handleReject(reqKey, resKey) {
      let reqId = this.dataSource[reqKey].id;
      let resId = this.responseIds[reqKey].responses[resKey].id;
      console.log(resId);
      request(REQ_REPLY, METHOD.POST, {
        requestId: reqId,
        responseId: resId,
        accept: 0,
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
    // delete
    handleDelete(key) {
      let reqId = this.dataSource[key].id;
      request(REQ_DEL, METHOD.POST, {
        requestId: reqId,
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
    // preview
    customRow(record) {
      return {
        on: {
          click: () => {
            console.log(record);
            this.currReq = record;
            this.showModal();
          },
        },
      };
    },

    toggleAdvanced() {
      this.advanced = !this.advanced;
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
    onSelectChange() {
      this.$message.info("选中行改变了");
    },
    addNew() {
      this.dataSource.unshift({
        key: this.dataSource.length,
        no: "NO " + this.dataSource.length,
        description: "这是一段描述",
        callNo: Math.floor(Math.random() * 1000),
        status: Math.floor(Math.random() * 10) % 4,
        updatedAt: "2018-07-26",
      });
    },
    handleMenuClick(e) {
      if (e.key === "delete") {
        this.remove();
      }
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
