<template>
  <a-card :body-style="{ padding: '24px 32px' }" :bordered="false">
    <a-form @submit="onSubmit" :form="form">
      <a-form-item
        :label="$t('title')"
        :labelCol="{ span: 7 }"
        :wrapperCol="{ span: 10 }"
      >
        <a-input
          :placeholder="$t('titleInput')"
          v-decorator="[
            'title',
            { rules: [{ required: true, message: '请输入请求主题' }] },
          ]"
        />
      </a-form-item>
      <a-form-item
        :label="'请求类型'"
        :labelCol="{ span: 7 }"
        :wrapperCol="{ span: 10 }"
      >
        <a-select
          :placeholder="'请选择请求类型'"
          v-decorator="[
            'type',
            { rules: [{ required: true, message: '请选择请求类型' }] },
          ]"
        >
          <a-select-option v-for="type in req_types" :key="type">{{
            type
          }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        :label="'请求人数'"
        :labelCol="{ span: 7 }"
        :wrapperCol="{ span: 10 }"
      >
        <a-input
          :placeholder="'请输入请求人数'"
          v-decorator="[
            'num',
            { rules: [{ required: true, message: '请输入请求人数' }] },
          ]"
        />
      </a-form-item>
      <a-form-item
        :label="$t('date')"
        :labelCol="{ span: 7 }"
        :wrapperCol="{ span: 10 }"
      >
        <a-date-picker
          style="width: 100%"
          v-decorator="[
            'dueDate',
            { rules: [{ required: true, message: '请输入请求结束日期' }] },
          ]"
        />
      </a-form-item>
      <a-form-item
        :label="$t('describe')"
        :labelCol="{ span: 7 }"
        :wrapperCol="{ span: 10 }"
      >
        <a-textarea
          rows="4"
          :placeholder="$t('describeInput')"
          v-decorator="[
            'desc',
            { rules: [{ required: true, message: '请输入请求描述' }] },
          ]"
        />
      </a-form-item>
      <a-form-item
        :label="'图片'"
        :labelCol="{ span: 7 }"
        :wrapperCol="{ span: 10 }"
      >
        <div
          class="list-item"
          v-for="(item, index) in uploadImg.showImages"
          :key="item.url"
        >
          <img
            v-if="item.type == 'origin'"
            :src="baseUrl + item.url"
            alt="相关图片"
          />
          <img v-else :src="item.url" alt="相关图片" style="width: 150px"/>
          <!-- 预览 -->
          <div class="item-hover">
            <a-icon
              style="margin-right: 10px"
              type="eye"
              @click="openPreview(index)"
            />
            <a-icon type="delete" @click="deleteRelateImg(index)" />
          </div>
        </div>
        <a-upload
          v-if="uploadImg.showImages && uploadImg.showImages.length < 1"
          list-type="picture-card"
          accept=".jpg, .png"
          :show-upload-list="false"
          :before-upload="beforeUpload"
          :customRequest="uploadImage"
          name="avatar"
          class="avatar-uploader"
          v-decorator="['img', { rules: [{ required: false }] }]"
        >
          <img v-if="imageUrl" :src="imageUrl" alt="avatar"/>
          <div v-else>
            <a-icon :type="loading ? 'loading' : 'plus'" />
            <div class="ant-upload-text">Upload</div>
          </div>
        </a-upload>
        <a-modal
          :visible="uploadImg.previewVisible"
          :footer="null"
          @cancel="closePreview"
        >
          <img
            alt="example"
            style="width: 100%"
            :src="uploadImg.previewImage"
          />
        </a-modal>
      </a-form-item>
      <a-form-item
        style="margin-top: 24px"
        :wrapperCol="{ span: 10, offset: 7 }"
      >
        <a-button htmlType="submit" type="primary">{{ $t("submit") }}</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script>
import { req_types, getBase64 } from "@/utils/util";
import { request, METHOD } from "@/utils/request";
import { REQ_ADD, REQ_IMG } from "@/services/api";

export default {
  name: "BasicForm",
  i18n: require("./i18n"),
  data() {
    return {
      req_types,
      value: 1,
      req_type: req_types[0],
      loading: false,
      imageUrl: "",
      form: this.$form.createForm(this),
      // 图片上传
      uploadImg: {
        showImages: [], // 相关图片
        previewVisible: false,
        previewImage: "",
      },
    };
  },
  mounted() {
    console.log(this.$route.params.request);
    if (this.$route.params && this.$route.params.request) {
      let req = this.$route.params.request;
      this.form.setFieldsValue({
        ...req,
      });
      if (req.imgUrl) {
        let ob = {
          type: "upload",
          src: req.imgUrl,
          url: process.env.VUE_APP_API_BASE_URL + "/api" + req.imgUrl, // TODO change to url
          // file,
        };
        this.uploadImg.showImages.push(ob);
      }
    }
  },
  computed: {
    desc() {
      return this.$t("pageDesc");
    },
  },
  methods: {
    onSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.logging = true;
          values.typeId = req_types.indexOf(values.type);
          delete values.type;
          console.log(this.$route.params.request);
          if (this.$route.params && this.$route.params.request) {
            console.log("111");
            values.id = this.$route.params.request.id;
          }
          let uploadImages = this.uploadImg.showImages;
          if (uploadImages && uploadImages.length) {
            values.imgUrl = uploadImages[0].src;
          }
          request(REQ_ADD, METHOD.POST, values).then((res) => {
            this.logging = false;
            const data = res.data;
            if (data.code === 0) {
              this.$router.push("/req/query");
              this.$message.success(data.message, 3);
            } else {
              this.$message.warn(data.message);
            }
          });
        }
      });
    },
    handleSelectChange(value) {
      console.log(value);
      this.form.setFieldsValue({
        type: value,
      });
    },
    handleChange(info) {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (imageUrl) => {
        this.imageUrl = imageUrl;
        this.loading = false;
        this.previewImage = this.imageUrl;
        this.previewVisible = true;
      });
    },
    beforeUpload(file) {
      const { type, size } = file;
      const limitType = type === "image/jpeg" || type === "image/png";
      if (!limitType) {
        this.$message.error("请上传 JPG、PNG 格式图片!");
      }
      const limitSize = size / 1024 / 1024 < 2;
      if (!limitSize) {
        this.$message.error("图片不可大于 2MB!");
      }
      return limitType && limitSize;
    },
    async uploadImage(fileInfo) {
      const { file } = fileInfo;
      try {
        const url = await this.fileToBase64(file); // 获取base64地址
        let formData = new FormData();
        formData.append("img", file);
        request(REQ_IMG, METHOD.POST, formData).then((res) => {
          this.logging = false;
          const data = res.data;
          if (data.code === 0) {
            let ob = {
              type: "upload",
              src: data.data,
              url, // TODO change to url
              file,
            };
            this.uploadImg.showImages.push(ob);
          } else {
            this.$message.warn(data.message);
          }
        });
      } catch (err) {
        this.$message.error(err.message);
      }
    },
    // 转换图片地址
    fileToBase64(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise((resolve, reject) => {
        reader.onload = function (e) {
          if (this.result) {
            resolve(this.result);
          } else {
            console.log(e);
            reject("图片转换错误，请稍后重试");
          }
        };
      });
    },
    // 照片墙预览
    openPreview(index) {
      // 服务器返回的拼接地址，自己上传的直接显示base64地址，这个根据自己后端返回的图片路径判断
      if (this.uploadImg.showImages[index].type === "upload") {
        this.uploadImg.previewImage = this.uploadImg.showImages[index].url;
      } else {
        this.uploadImg.previewImage =
          this.baseUrl + this.uploadImg.showImages[index].url;
      }
      this.uploadImg.previewVisible = true;
    },
    closePreview() {
      this.uploadImg.previewVisible = false;
    },

    // 删除上传图片
    deleteRelateImg(index) {
      let that = this;
      this.$confirm({
        title: `确定删除该图片?`,
        okType: "danger",
        onOk() {
          that.uploadImg.showImages.splice(index, 1);
        },
      });
    },
  },
};
</script>

<style lang="less" scoped>
.relate-image {
  display: flex;
  width: 100%;

  .image-list {
    width: 100%;
    display: flex;
    flex-wrap: wrap;

    .list-item {
      position: relative;
      height: 104px;
      margin: 0 8px 8px 0;
      padding: 8px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;

      img {
        min-width: 50px;
        height: 100%;
      }

      .item-hover {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 9;
        display: none;
        justify-content: center;
        align-items: center;
        width: calc(100% - 16px);
        height: 88px;
        color: #fff;
        background: rgba(0, 0, 0, 0.2);
        transform: translate(-50%, -50%);
        cursor: pointer;
      }

      &:hover .item-hover {
        display: flex;
      }
    }
  }
}
</style>
