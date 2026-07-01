<template>
  <div>
    <div
      style="
        text-align: right;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
      "
    >
      <button @click="toggleTheme">切换主题</button>
      <button @click="exportPng">导出图片</button>
    </div>
    <div ref="contentRef" class="content-wrapper">
      <header class="content-header">
        <h1>一级标题 Heading 1</h1>
      </header>

      <section>
        <h2>二级标题 Heading 2</h2>
        <p>
          这是一个段落，包含
          <strong>粗体文本</strong
          >、<em>斜体文本</em>、<del>删除线</del>、<ins>下划线</ins>、<mark>高亮标记</mark>、<small>小号字体</small>、H<sub>2</sub>O
          和 X<sup>2</sup>+Y<sup>2</sup>=Z<sup>2</sup>。
        </p>
        <p>
          <a href="https://example.com" target="_blank">这是一个链接</a
          >，点击跳转到示例网站。
        </p>
      </section>

      <section>
        <h3>三级标题 - 列表</h3>
        <div class="lists-container">
          <div class="list-section">
            <h4>无序列表</h4>
            <ul>
              <li>列表项一</li>
              <li>
                列表项二
                <ul>
                  <li>嵌套列表项</li>
                  <li>嵌套列表项</li>
                </ul>
              </li>
              <li>列表项三</li>
            </ul>
          </div>
          <div class="list-section">
            <h4>有序列表</h4>
            <ol>
              <li>第一步</li>
              <li>第二步</li>
              <li>第三步</li>
            </ol>
          </div>
          <div class="list-section">
            <h4>定义列表</h4>
            <dl>
              <dt>HTML</dt>
              <dd>超文本标记语言，用于构建网页结构</dd>
              <dt>CSS</dt>
              <dd>层叠样式表，用于美化网页样式</dd>
            </dl>
          </div>
        </div>
      </section>

      <section>
        <h3>三级标题 - grid布局</h3>
        <div class="grid-container">
          <div class="grid-item">1</div>
          <div class="grid-item">2</div>
          <div class="grid-item">3</div>
          <div class="grid-item">4</div>
          <div class="grid-item">5</div>
          <div class="grid-item">6</div>
        </div>
      </section>

      <section>
        <h3>三级标题 - 引用与代码</h3>
        <blockquote>
          <p>
            这是一段引用文本。优秀的代码是它自己最好的文档。当你需要添加注释时，问问自己是否可以改进代码使其更清晰。
          </p>
          <footer>— Robert C. Martin</footer>
        </blockquote>
        <div class="code-section">
          <h4>行内代码</h4>
          <p>使用 <code>npm install</code> 安装依赖包。</p>
          <h4>代码块</h4>
          <pre><code>function hello(name) {
  console.log('Hello, ' + name + '!');
}
hello('World');</code></pre>
        </div>
      </section>

      <section>
        <h3>三级标题 - 表格</h3>
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>职位</th>
              <th>部门</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>张三</td>
              <td>前端工程师</td>
              <td>技术部</td>
            </tr>
            <tr>
              <td>李四</td>
              <td>后端工程师</td>
              <td>技术部</td>
            </tr>
            <tr>
              <td>王五</td>
              <td>产品经理</td>
              <td>产品部</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3>三级标题 - 表单</h3>
        <form>
          <div class="form-group">
            <label for="username">用户名：</label>
            <input type="text" id="username" placeholder="请输入用户名" />
          </div>
          <div class="form-group">
            <label for="email">邮箱：</label>
            <input type="email" id="email" placeholder="请输入邮箱" />
          </div>
          <div class="form-group">
            <label for="password">密码：</label>
            <input type="password" id="password" placeholder="请输入密码" />
          </div>
          <div class="form-group">
            <label for="gender">性别：</label>
            <select id="gender">
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>兴趣爱好：</label>
            <div class="checkbox-group">
              <label
                ><input type="checkbox" name="hobby" value="coding" />
                编程</label
              >
              <label
                ><input type="checkbox" name="hobby" value="reading" />
                阅读</label
              >
              <label
                ><input type="checkbox" name="hobby" value="music" />
                音乐</label
              >
            </div>
          </div>
          <div class="form-group">
            <label>状态：</label>
            <div class="radio-group">
              <label
                ><input type="radio" name="status" value="active" checked />
                在线</label
              >
              <label
                ><input type="radio" name="status" value="inactive" />
                离线</label
              >
            </div>
          </div>
          <div class="form-group">
            <label for="message">留言：</label>
            <textarea
              id="message"
              rows="4"
              placeholder="请输入留言内容"
            ></textarea>
          </div>
          <div class="form-group">
            <button type="submit">提交</button>
            <button type="reset">重置</button>
          </div>
        </form>
      </section>

      <section>
        <h3>三级标题 - 多媒体与分隔</h3>
        <figure>
          <img
            src="https://picsum.photos/id/1/400/200"
            alt="示例图片"
            class="demo-image"
          />
          <figcaption>图片说明文字</figcaption>
        </figure>
        <hr />
        <p>这是分隔线下方的内容。</p>
      </section>

      <section>
        <h3>三级标题 - 语义化标签</h3>
        <article class="article-card">
          <h4>文章标题</h4>
          <p>这是一篇文章的内容摘要，使用 article 标签包裹。</p>
        </article>
        <aside class="aside-card">
          <h4>侧边栏信息</h4>
          <p>这是侧边栏内容，使用 aside 标签。</p>
        </aside>
        <address>
          联系方式：<a href="mailto:contact@example.com">contact@example.com</a>
        </address>
      </section>

      <footer class="content-footer">
        <p>© 2024 示例网站 | 保留所有权利</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toBlob } from "dom-to-image-modern";
import { ref } from "vue";

const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const contentRef = ref<HTMLDivElement>();
const exportPng = () => {
  toBlob(contentRef.value!).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.png";
    a.click();
    URL.revokeObjectURL(url);
  });
};
</script>

<style lang="postcss">
@import "./style.css";
</style>
