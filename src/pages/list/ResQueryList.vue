<template>
  <a-card>
    <div>
      <a-modal
        title="我可以"
        :visible="visible"
        @ok="handleOk"
        @cancel="handleCancel"
      >
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
        <a-form @submit="handleOk" :form="form" style="padding-top: 10px">
          <a-form-item
            label="响应描述"
            :labelCol="{ span: 5 }"
            :wrapperCol="{ span: 18, offset: 1 }"
          >
            <a-textarea
              rows="4"
              :placeholder="'请输入响应描述'"
              v-decorator="[
                'desc',
                { rules: [{ required: true, message: '请输入响应描述' }] },
              ]"
            />
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
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
            <!-- <a-col :md="12" :sm="24">
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
            </a-col> -->
            <!-- <a-col :md="8" :sm="24" >
            <a-form-item
              label="调用次数"
              :labelCol="{span: 5}"
              :wrapperCol="{span: 18, offset: 1}"
            >
              <a-input-number style="width: 100%" placeholder="请输入" />
            </a-form-item>
          </a-col>
        </a-row>
          <a-row v-if="advanced">
          <a-col :md="8" :sm="24" >
            <a-form-item
              label="更新日期"
              :labelCol="{span: 5}"
              :wrapperCol="{span: 18, offset: 1}"
            >
              <a-date-picker style="width: 100%" placeholder="请输入更新日期" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24" >
            <a-form-item
              label="使用状态"
              :labelCol="{span: 5}"
              :wrapperCol="{span: 18, offset: 1}"
            >
              <a-select placeholder="请选择">
                <a-select-option value="1">关闭</a-select-option>
                <a-select-option value="2">运行中</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24" >
            <a-form-item
              label="描述"
              :labelCol="{span: 5}"
              :wrapperCol="{span: 18, offset: 1}"
            >
              <a-input placeholder="请输入" />
            </a-form-item>
          </a-col> -->
          </a-row>
        </div>
        <!-- <span style="float: right; margin-top: 3px">
          <a-button type="primary">查询</a-button>
          <a-button style="margin-left: 8px">重置</a-button>
          <a @click="toggleAdvanced" style="margin-left: 8px">
            {{advanced ? '收起' : '展开'}}
            <a-icon :type="advanced ? 'up' : 'down'" />
          </a>
        </span> -->
      </a-form>
    </div>
    <div>
      <standard-table
        :columns="columns"
        :dataSource="searchResult"
        @clear="onClear"
        @change="onChange"
      >
        <!-- <div slot="responses" slot-scope="{ record }">
          <a-select
            v-model="selectedRes[record.key]"
            :allowClear="true"
          >
            <a-select-option v-for="res in record.responses" :key="res">{{res}}</a-select-option>
          </a-select>
        </div> -->
        <!-- <div slot="description" slot-scope="{ text }">
          {{ text + "111" }}
          {{ 111 }}
        </div> -->
        <div slot="action" slot-scope="{ record }">
          <!-- <a style="margin-right: 8px">
            <a-icon type="plus"/>新增
          </a> -->
          <a
            @click="showModal(record.key)"
            :disabled="record.state !== '待响应'"
          >
            <a-icon type="delete" />我可以！
          </a>
          <!-- <a @click="showModal" style="margin-right: 8px"> <a-icon type="edit" />编辑 </a>
          <a @click="deleteRecord(record.key)">
            <a-icon type="delete" />删除
          </a>
          <a @click="deleteRecord(record.key)" v-if="selectedRes[record.key]">
            <a-icon type="delete" />接受
          </a>
          <a @click="deleteRecord(record.key)" v-if="selectedRes[record.key]">
            <a-icon type="delete" />拒绝
          </a> -->
        </div>
        <template slot="statusTitle">
          <a-icon @click.native="onStatusTitleClick" type="info-circle" />
        </template>
      </standard-table>
    </div>
  </a-card>
</template>

<script>
import { mapState } from "vuex";
import { req_types } from "@/utils/util";
import StandardTable from "@/components/table/StandardTable";
import { request, METHOD } from "@/utils/request";
import { RES_ADD, RES_REQ_LIST } from "@/services/api";

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
    title: "请求人数",
    dataIndex: "num",
    // sorter: true
  },
  {
    title: "请求状态",
    dataIndex: "state",
  },
  // {
  //   title: "响应列表",
  //   dataIndex: "responses",
  //   scopedSlots: { customRender: "responses" },
  // },
  {
    title: "操作",
    scopedSlots: { customRender: "action" },
  },
];

const dataSource = [];
const selectedRes = [];

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
    responses: ["111", "222"],
  });
  selectedRes.push(undefined);
}

export default {
  name: "ResQueryList",
  inject: ["reload"],
  components: { StandardTable },
  data() {
    return {
      req_types,
      selectedRes,
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
      nowData: "",
      defaultImg: require("@/assets/img/logo.png"),
    };
  },
  created() {
    request(RES_REQ_LIST, METHOD.GET).then((res) => {
      console.log(res);
      this.logging = false;
      const data = res.data;
      if (data.code === 0) {
        this.dataSource = data.data.filter((item) => {
          return item.userId != this.currUser.userId;
        });
        this.dataSource = this.dataSource.map((item, index) => {
          item.key = index;
          item.type = this.req_types[item.typeId];
          return item;
        });
      } else {
        this.$message.warn(data.message);
      }
    });
    this.getNowDate();
  },
  computed: {
    ...mapState("account", { currUser: "user" }),
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
    // form
    showModal(key) {
      console.log(key);
      this.visible = true;
      this.currReq = this.dataSource[key];
      if (this.currReq.imgUrl) {
        this.currReq.imgUrl =
          process.env.VUE_APP_API_BASE_URL + "/api" + this.currReq.imgUrl;
      }
    },
    handleOk(e) {
      e.preventDefault();
      this.form.validateFields((err) => {
        if (!err) {
          let requestId = this.currReq.id;
          let desc = this.form.getFieldValue("desc");
          request(RES_ADD, METHOD.POST, {
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
    deleteRecord(key) {
      // console.log(this.searchStr)
      this.dataSource = this.dataSource.filter((item) => item.key !== key);
      // this.selectedRows = this.selectedRows.filter((item) => item.key !== key);
    },
    toggleAdvanced() {
      this.advanced = !this.advanced;
    },
    // time
    getNowDate() {
      const nowDate = new Date();
      const date = {
        year: nowDate.getFullYear(),
        month: nowDate.getMonth() + 1,
        date: nowDate.getDate(),
      };
      const newmonth = date.month > 10 ? date.month : "0" + date.month;
      const day = date.date > 10 ? date.date : "0" + date.date;
      this.nowDate = date.year + "-" + newmonth + "-" + day;
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
