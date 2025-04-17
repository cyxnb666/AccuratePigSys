import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login/index.vue')
    },
    {
        path: '/',
        component: () => import('@/views/Main/index.vue'),
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('@/views/Dashboard/index.vue'),
                meta: {
                    title: '精准核验大屏',
                    icon: 'dashboard'
                }
            },
            {
                path: 'tenant',
                name: 'tenant',
                component: () => import('@/views/TenantManagement/index.vue'),
                meta: {
                    title: '租户管理',
                    icon: 'team'
                }
            },
            {
                path: 'district',
                name: 'district',
                component: () => import('@/views/DistrictManagement/index.vue'),
                meta: {
                    title: '行政区划管理',
                    icon: 'apartment'
                }
            },
            {
                path: 'user',
                name: 'user',
                component: () => import('@/views/Error/404.vue'),
                meta: {
                    title: '用户管理',
                    icon: 'user'
                }
            },
            {
                path: 'scene',
                name: 'scene',
                component: () => import('@/views/Error/404.vue'),
                meta: {
                    title: '界限场景管理',
                    icon: 'environment'
                }
            },
            {
                path: 'review',
                name: 'review',
                component: () => import('@/views/Error/404.vue'),
                meta: {
                    title: '存档上报审核',
                    icon: 'file-done'
                }
            },
            {
                path: 'archive',
                name: 'archive',
                component: () => import('@/views/Error/404.vue'),
                meta: {
                    title: '存档清单',
                    icon: 'file-text'
                }
            },
            {
                path: 'warning',
                name: 'warning',
                component: () => import('@/views/Error/404.vue'),
                meta: {
                    title: '界线预警',
                    icon: 'warning'
                }
            }
        ]
    },
    {
        path: '/:catchAll(.*)',
        component: () => import('@/views/Error/404.vue')
    }
];

const router = createRouter({
    history: createWebHashHistory('/'),
    routes: routes
});

// 路由默认重定向到租户管理
router.beforeEach((to, _, next) => {
    if (to.path === '/') {
        next('/tenant');
    } else {
        next();
    }
});

export default router;