# 小黄大王日报 Tencent CloudBase 部署说明

这个目录包含“预约拜见小黄大王”的云函数后端。网站本体在仓库根目录，整理后的上传版本会放在 `tencent-cloud-site/`。

## 一、静态网站上传

1. 打开腾讯云控制台，进入 CloudBase。
2. 创建一个云开发环境，选择按量计费即可。
3. 进入「静态网站托管」，上传 `tencent-cloud-site/` 文件夹里的全部文件。
4. 先用 CloudBase 分配的默认域名测试页面。

## 二、创建数据库集合

在 CloudBase 控制台进入「数据库」，新建集合：

```text
audience_submissions
```

权限建议先设为“仅服务端可读写”。这样访客不能直接读数据库，只有云函数能写入。

## 三、部署云函数

在 CloudBase 控制台进入「云函数」，新建 Node.js 函数：

```text
audience-submit
```

把 `cloudbase/audience-submit/` 里的 `index.js` 和 `package.json` 上传到这个云函数，安装依赖并部署。

随后为这个云函数开启 HTTP 访问服务，复制生成的访问地址。

## 四、填写表单上传地址

打开网站根目录的 `site-config.js`，把 HTTP 访问地址填进去：

```js
window.XHDW_CONFIG = {
  audienceEndpoint: "https://你的云函数访问地址"
};
```

重新上传静态网站文件。之后访客提交的预约信息会写入 `audience_submissions` 集合，你可以在 CloudBase 数据库控制台查看。

## 五、建议

- 不要在前端代码里放腾讯云密钥、GitHub Token 或任何私密密码。
- 如果以后绑定自有域名，大陆服务商通常会要求先完成 ICP 备案。
- 这个表单会收集姓名和留言，公开给别人访问前，建议在页面底部加一句简短隐私说明。
