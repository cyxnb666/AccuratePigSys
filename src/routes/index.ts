import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import { 
  DashboardOutlined, 
  TeamOutlined, 
  ApartmentOutlined, 
  UserOutlined,
  EnvironmentOutlined,
  FileDoneOutlined,
  FolderOutlined,
  FileTextOutlined,
  WarningOutlined
} from '@ant-design/icons-vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login/index.vue')
    },
    {
        path: '/',
        name: 'Main',
        component: () => import('@/views/Main/index.vue'),
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('@/views/Dashboard/index.vue'),
                meta: {
                    title: '精准核验大屏',
                    icon: DashboardOutlined
                }
            },
            {
                path: 'tenant',
                name: 'tenant',
                component: () => import('@/views/TenantManagement/index.vue'),
                meta: {
                    title: '租户管理',
                    icon: TeamOutlined
                }
            },
            {
                path: 'district',
                name: 'district',
                component: () => import('@/views/DistrictManagement/index.vue'),
                meta: {
                    title: '行政区划管理',
                    icon: ApartmentOutlined
                }
            },
            {
                path: 'user',
                name: 'user',
                component: () => import('@/views/UserManagement/index.vue'),
                meta: {
                    title: '用户管理',
                    icon: UserOutlined
                }
            },
            {
                path: 'farm',
                name: 'farm',
                component: () => import('@/views/FarmManagement/index.vue'),
                meta: {
                    title: '养殖场管理',
                    icon: EnvironmentOutlined
                }
            },
            {
                path: 'review',
                name: 'review',
                component: () => import('@/views/Review/index.vue'),
                meta: {
                    title: '存档上报审核',
                    icon: FileDoneOutlined
                }
            },
            {
                path: 'Report',
                name: 'Report',
                component: () => import('@/views/ReportReminder/index.vue'),
                meta: {
                    title: '上报提醒',
                    icon: FolderOutlined
                }
            },
            {
                path: 'archive',
                name: 'archive',
                component: () => import('@/views/InventoryList/index.vue'),
                meta: {
                    title: '存档清单',
                    icon: FileTextOutlined
                }
            },
            {
                path: 'warning',
                name: 'warning',
                // component: () => import('@/views/Error/404.vue'),
                component: () => import('@/views/Warning/index.vue'),
                meta: {
                    title: '异常预警',
                    icon: WarningOutlined
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