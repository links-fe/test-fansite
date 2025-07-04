import {
  MobileNoTabbarLayout,
  MobileTabbarLayout,
  PcChatLayout,
  PcEmptyLayout,
  PcHooksLayout,
  PcLoginLayout,
  PcMenuLayout,
  PcSettingLayout,
} from '@/components/Layout/BusinessLayouts'
import { DemoLayout } from '@/components/Layout/DemoLayout'

interface RouterConfigInfo {
  // 添加路径匹配模式, 用于动态路由
  pattern?: RegExp
  // pc page布局
  pcPageLayout?: React.ComponentType<{ children: React.ReactNode }>
  // mobile page布局
  mobilePageLayout?: React.ComponentType<{ children: React.ReactNode }>
  // 是否需要登录
  isAuth?: boolean
  // 子路由
  children?: Record<string, RouterConfigInfo>
}
// menu layout 配置
export const routerLayoutConfigInfo: Record<string, RouterConfigInfo> = {
  '/': {
    pcPageLayout: PcEmptyLayout,
    mobilePageLayout: MobileNoTabbarLayout,
    children: {
      '/home': {
        isAuth: true,
        pcPageLayout: PcMenuLayout,
        mobilePageLayout: MobileTabbarLayout,
      },
      '/hooks': {
        isAuth: true,
        pcPageLayout: PcHooksLayout,
        mobilePageLayout: MobileTabbarLayout,
      },
      'share-link': {},
      /**----------------------------------- message 页面 -----------------------------------*/
      '/message': {
        pcPageLayout: PcChatLayout,
        mobilePageLayout: MobileTabbarLayout,
        children: {
          // 动态路由示例：匹配 /message/123 这样的路径
          '/message/:id': {
            mobilePageLayout: MobileNoTabbarLayout,
            pattern: /^\/message\/\w+$/,
          },
        },
      },
      /**----------------------------------- more 页面 -----------------------------------*/
      '/more': {
        isAuth: true,
        pcPageLayout: PcSettingLayout,
        mobilePageLayout: MobileTabbarLayout,
        children: {
          '/more/profile': {
            mobilePageLayout: MobileNoTabbarLayout,
            children: {
              '/more/profile/bio': {},
              '/more/profile/location': {},
              '/more/profile/name': {},
              '/more/profile/username': {},
            },
          },
          '/more/setting': {
            mobilePageLayout: MobileNoTabbarLayout,
            children: {
              '/more/setting/about': {
                children: {
                  '/more/setting/about/detail': {},
                },
              },
              '/more/setting/account': {
                children: {
                  '/more/setting/account/change-email': {},
                  '/more/setting/account/change-password': {},
                  '/more/setting/account/third-party-accounts': {},
                },
              },
              '/more/setting/delete-account': {},
              '/more/setting/help-center': {
                children: {
                  '/more/setting/help-center/faq-details': {},
                  '/more/setting/help-center/faq': {},
                  '/more/setting/help-center/feedback': {},
                },
              },
              '/more/setting/notifications': {
                children: {
                  '/more/setting/notifications/email': {},
                  '/more/setting/notifications/push': {},
                },
              },
              '/more/setting/privacy': {
                children: {
                  '/more/setting/privacy/blocked': {
                    children: { '/more/setting/privacy/blocked/store': {} },
                  },
                  '/more/setting/privacy/visibility': {
                    children: { '/more/setting/privacy/visibility/store': {} },
                  },
                },
              },
            },
          },
        },
      },
      '/--demo': {
        pcPageLayout: PcMenuLayout,
        mobilePageLayout: MobileNoTabbarLayout,
        children: {
          '/--demo/chat': {
            pcPageLayout: PcEmptyLayout,
            mobilePageLayout: MobileNoTabbarLayout,
          },
          '/--demo/login': {
            pcPageLayout: PcLoginLayout,
            children: {
              '/--demo/login/creator-share': {},
            },
          },
          '/--demo/game': {
            children: {
              '/--demo/game/clean-stickers': {
                pcPageLayout: DemoLayout,
              },
            },
          },
          '/--demo/google': {
            pcPageLayout: DemoLayout,
          },
          '/--demo/google-recaptcha': {
            pcPageLayout: DemoLayout,
          },
        },
      },
    },
  },
}

// 添加一个辅助函数来获取路由配置
export const getRouterConfig = (
  path?: string,
): Pick<RouterConfigInfo, 'isAuth' | 'pcPageLayout' | 'mobilePageLayout'> => {
  // 处理空路径或undefined的情况，返回根路径的配置
  if (!path) {
    return {
      pcPageLayout: PcEmptyLayout,
      mobilePageLayout: MobileNoTabbarLayout,
    }
  }

  // 获取根路径配置
  const rootConfig = routerLayoutConfigInfo['/']
  if (!rootConfig || !rootConfig.children) {
    return {
      pcPageLayout: PcEmptyLayout,
      mobilePageLayout: MobileNoTabbarLayout,
    }
  }

  // 移除开头的'/'并分割路径
  const pathSegments = path.split('/').filter(Boolean)

  // 如果是根路径'/'
  if (pathSegments.length === 0) {
    return {
      pcPageLayout: rootConfig.pcPageLayout,
      mobilePageLayout: rootConfig.mobilePageLayout,
    }
  }

  // 构建路径并逐级查找配置
  let currentPath = ''
  let result: Pick<RouterConfigInfo, 'isAuth' | 'pcPageLayout' | 'mobilePageLayout'> = {
    pcPageLayout: rootConfig.pcPageLayout,
    mobilePageLayout: rootConfig.mobilePageLayout,
    isAuth: rootConfig.isAuth,
  }

  let currentConfig = rootConfig

  // 逐级遍历路径
  for (const segment of pathSegments) {
    currentPath = currentPath ? `${currentPath}/${segment}` : `/${segment}`

    if (!currentConfig.children) {
      break
    }

    // 检查精确匹配
    let nextConfig = currentConfig.children[currentPath]

    // 如果没有精确匹配，检查动态路由
    if (!nextConfig) {
      for (const [_, config] of Object.entries(currentConfig.children)) {
        if (config.pattern && config.pattern.test(currentPath)) {
          nextConfig = config
          break
        }
      }
    }

    if (nextConfig) {
      // 继承配置，只继承存在的属性
      result = {
        pcPageLayout: nextConfig.pcPageLayout ?? result.pcPageLayout,
        mobilePageLayout: nextConfig.mobilePageLayout ?? result.mobilePageLayout,
        isAuth: nextConfig.isAuth ?? result.isAuth,
      }
      currentConfig = nextConfig
    }
  }

  return result
}

// 将1转为 1fr 或者 1:1 转为 1fr 1fr
export const getContentRatio = (ratio?: string) => {
  if (!ratio) return '1fr'
  const arr = ratio?.split(':')
  if (arr.length === 1) return '1fr'
  if (arr.length === 2) return `${arr[0]}fr ${arr[1]}fr`
}
