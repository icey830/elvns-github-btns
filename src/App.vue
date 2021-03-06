<template>
  <div id="app">
    <form autocapitalize="none" autocomplete="off" autocorrect="off" spellcheck="false">
      <fieldset class="form-group">
        <h4>请选择一个按钮类型</h4>
        <div class="row">
          <div class="col-9 col-sm-6 col-md-4 col-lg-2" v-for="type in types" :key="type.value">
            <div class="form-check">
              <label class="form-check-label">
                <input type="radio" class="form-check-input" name="type" :value="type.value" v-model="options.type">{{ type.value | capitalize }}<br>
                <github-button href="#" data-size="large" :data-icon="type.icon" :data-text="$options.filters.capitalize(type.value)" aria-hidden="true"></github-button>
              </label>
            </div>
          </div>
        </div>
      </fieldset>
      <hr>
      <div class="row" v-if="options.type">
        <div class="col-12 col-sm-6 col-md-4">
          <h4>Button options</h4>
          <div class="form-group">
            <div class="input-group">
              <input ref="user" class="form-control" type="text" maxlength="39" placeholder=":user" autofocus="autofocus" :class="{ 'is-invalid': options.user !== '' && !isValidUser }" v-model="options.user">
              <div class="input-group-append input-group-prepend">
                <span class="input-group-text">/</span>
              </div>
              <input ref="repo" class="form-control" type="text" maxlength="100" placeholder=":repo" :disabled="options.type === 'follow'" :class="{ 'is-invalid': options.repo !== '' && !isValidRepo }" v-model="options.repo">
            </div>
          </div>
          <div class="form-group">
            <div class="checkbox">
              <label>
                <input type="checkbox" v-model="options.largeButton"> 使用大按钮
              </label>
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" :disabled="options.type === 'download'" v-model="options.showCount"> 显示计数值
              </label>
            </div>
            <div class="checkbox">
              <label>
                <input type="checkbox" v-model="options.standardIcon"> 使用默认图标
              </label>
            </div>
          </div>
          <div class="form-group">
            <label for="syntax">Syntax</label>
            <select id="syntax" class="custom-select" v-model="options.syntax">
              <option>html</option>
              <option value="vue">vue-github-button</option>
              <option value="react">react-github-btn</option>
            </select>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-md-8">
          <h4>Preview and code</h4>
          <p>Try out your button, then copy and paste the code below into the HTML for your site.</p>
          <p :style="{ height: options.largeButton ? '28px' : '20px' }">
            <github-button v-bind="getPreviewAttrs()"></github-button>
          </p>
          <div class="form-group">
            <Snippet :code="templateHTML"></Snippet>
          </div>
          <div class="form-group">
            <Snippet :code="scriptHTML"></Snippet>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
  import './main.css'
  import GithubButton from 'vue-github-button'
  import Snippet from '@/components/Snippet'

  export default {
    name: 'app',
    components: {
      GithubButton,
        Snippet
    },
    data () {
      return {
        types: [
          {
            value: 'follow',
            icon: 'octicon-mark-github'
          },
          {
            value: 'watch',
            icon: 'octicon-eye'
          },
          {
            value: 'star',
            icon: 'octicon-star'
          },
          {
            value: 'fork',
            icon: 'octicon-repo-forked'
          },
          {
            value: 'issue',
            icon: 'octicon-issue-opened'
          },
          {
            value: 'download',
            icon: 'octicon-cloud-download'
          }
        ],
        options: {
          user: '',
          repo: '',
          type: null,
          largeButton: false,
          showCount: false,
          standardIcon: false,
          syntax: ((referrer) => {
            if (/\bvue-github-button\b/i.test(referrer)) {
              return 'vue'
            }
            if (/\breact-github-btn\b/i.test(referrer)) {
              return 'react'
            }
            return 'html'
          })(document.referrer)
        },
        timeoutID: 0
      }
    },
    watch: {
      'options.type' () {
        this.$nextTick(() => {
          if (document.activeElement !== this.$refs.user && document.activeElement !== this.$refs.repo) {
            if (this.options.type === 'follow' || !this.isValidUser || (this.isValidUser && this.isValidRepo)) {
              this.$refs.user.focus()
            } else {
              this.$refs.repo.focus()
            }
          }
        })
      },
      'attrs.href' () {
        if (this.attrs['data-show-count']) {
          clearTimeout(this.timeoutID)
          this.timeoutID = setTimeout(() => {
            this.timeoutID = 0
          }, 300)
        }
      }
    },
    computed: {
      isValidUser () {
        const user = this.options.user
        return user.length > 0 && user.length < 40 && !/[^A-Za-z0-9-]|^-|-$|--/i.test(user)
      },
      isValidRepo () {
        const repo = this.options.repo
        return repo.length > 0 && repo.length < 101 && !/[^\w-.]|\.git$|^\.\.?$/i.test(repo)
      },
      attrs () {
        const options = { ...this.options }

        if (!this.isValidUser || (!this.isValidRepo && options.type !== 'follow')) {
          options.user = 'icey830'
          options.repo = 'elvns-github-btns'
        }

        return {
          href: (() => {
            const base = 'https://github.com'
            const user = '/' + options.user
            const repo = user + '/' + options.repo
            switch (options.type) {
              case 'follow':
                return base + user
              case 'watch':
                return base + repo + '/subscription'
              case 'star':
                return base + repo
              case 'fork':
                return base + repo + '/fork'
              case 'issue':
                return base + repo + '/issues'
              case 'download':
                return base + repo + '/archive/master.zip'
              default:
                return base
            }
          })(),
          'data-text': (() => {
            return this.$options.filters.capitalize(options.type) + (options.type === 'follow' ? ' @' + options.user : '')
          })(),
          'data-icon': (() => {
            if (options.standardIcon) {
              return
            }
            switch (options.type) {
              case 'watch':
                return 'octicon-eye'
              case 'star':
                return 'octicon-star'
              case 'fork':
                return 'octicon-repo-forked'
              case 'issue':
                return 'octicon-issue-opened'
              case 'download':
                return 'octicon-cloud-download'
            }
          })(),
          'data-size': (() => {
            if (options.largeButton) {
              return 'large'
            }
          })(),
          'data-show-count': (() => {
            if (options.showCount) {
              switch (options.type) {
                case 'download':
                  return
                default:
                  return true
              }
            }
          })(),
          'aria-label': (() => {
            return this.$options.filters.capitalize(options.type) + (options.type === 'follow' ? ' @' + options.user : ' ' + options.user + '/' + options.repo) + ' on GitHub'
          })()
        }
      },
      templateHTML () {
        const a = document.createElement('a')

        if (this.options.syntax === 'html') {
          a.className = 'github-button'
        }

        const attrs = this.attrs
        for (let key in attrs) {
          if (attrs[key] != null) {
            if (key === 'data-text') {
              a.textContent = attrs[key]
            } else {
              a.setAttribute(key, attrs[key])
            }
          }
        }
        return '<!-- Place this tag where you want the button to render. -->\n' + ((html) => {
          switch (this.options.syntax) {
            case 'vue':
              return html.replace(/^<a/, '<github-button').replace(/a>$/, 'github-button>')
            case 'react':
              return html.replace(/^<a/, '<GitHubButton').replace(/a>$/, 'GitHubButton>')
            default:
              return html
          }
        })(a.outerHTML)
      },
      scriptHTML () {
        switch (this.options.syntax) {
          case 'vue':
            return 'import GithubButton from \'vue-github-button\'\n\nexport default {\n  components: {\n    GithubButton\n  },\n  // ...\n}'
          case 'react':
            return 'import GitHubButton from \'react-github-btn\''
          default:
            return '<!-- Place this tag in your head or just before your close body tag. -->\n<script async defer src="https://git.elvns.com/btn/button.js"></scr' + 'ipt>'
        }
      }
    },
    filters: {
      capitalize (value) {
        if (!value) return ''
        value = value.toString()
        return value.charAt(0).toUpperCase() + value.slice(1)
      }
    },
    methods: {
      getPreviewAttrs () {
        return { ...this.attrs, 'data-show-count': this.attrs['data-show-count'] && !this.timeoutID }
      }
    }
  }
</script>

<style scoped>
  p {
    overflow-x: auto;
    overflow-y: hidden;
  }

  .form-check-label::before {
    position: absolute;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
    content: '';
  }
</style>
