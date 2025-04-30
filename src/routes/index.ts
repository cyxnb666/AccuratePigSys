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

// 基础路由（不需要权限验证的路由）
const constantRoutes: Array<RouteRecordRaw> = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login/index.vue')
    },
    {
        path: '/404',
        name: '404',
        component: () => import('@/views/Error/404.vue')
    }
];

// 需要权限验证的路由
export const asyncRoutes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Main',
        component: () => import('@/views/Main/index.vue'),
        children: [
            {
                path: 'HOME',
                name: 'HOME',
                component: () => import('@/views/Dashboard/index.vue'),
                meta: {
                    title: '精准核验大屏',
                    icon: DashboardOutlined,
                    permission: 'HOME'
                }
            },
            {
                path: 'TENCENT',
                name: 'TENCENT',
                component: () => import('@/views/TenantManagement/index.vue'),
                meta: {
                    title: '租户管理',
                    icon: TeamOutlined,
                    permission: 'TENCENT'
                }
            },
            {
                path: 'AREA',
                name: 'AREA',
                component: () => import('@/views/DistrictManagement/index.vue'),
                meta: {
                    title: '行政区划管理',
                    icon: ApartmentOutlined,
                    permission: 'AREA'
                }
            },
            {
                path: 'USER',
                name: 'USER',
                component: () => import('@/views/UserManagement/index.vue'),
                meta: {
                    title: '用户管理',
                    icon: UserOutlined,
                    permission: 'USER'
                }
            },
            {
                path: 'FARM',
                name: 'FARM',
                component: () => import('@/views/FarmManagement/index.vue'),
                meta: {
                    title: '养殖场管理',
                    icon: EnvironmentOutlined,
                    permission: 'FARM'
                }
            },
            {
                path: 'AUDITD',
                name: 'AUDITD',
                component: () => import('@/views/Review/index.vue'),
                meta: {
                    title: '存栏上报审核',
                    icon: FileDoneOutlined,
                    permission: 'AUDITD'
                }
            },
            {
                path: 'WARN',
                name: 'WARN',
                component: () => import('@/views/ReportReminder/index.vue'),
                meta: {
                    title: '上报提醒',
                    icon: FolderOutlined,
                    permission: 'WARN'
                }
            },
            {
                path: 'WARN/detail/:id',
                name: 'warnDetail',
                component: () => import('@/views/ReportReminder/components/ReminderDetail.vue'),
                meta: {
                    title: '提醒记录详情',
                    hideInMenu: true,
                    permission: 'WARN'
                }
            },
            {
                path: 'KEEP',
                name: 'KEEP',
                component: () => import('@/views/InventoryList/index.vue'),
                meta: {
                    title: '存栏清单',
                    icon: FileTextOutlined,
                    permission: 'KEEP'
                }
            },
            {
                path: 'KEEP/details/:id',
                name: 'keepDetails',
                component: () => import('@/views/InventoryList/components/InventoryDetails.vue'),
                meta: {
                    title: '存栏详情',
                    hideInMenu: true,
                    permission: 'KEEP'
                }
            },
            {
                path: 'FARM/edit',
                name: 'farmEdit',
                component: () => import('@/views/FarmManagement/components/FarmEdit.vue'),
                meta: {
                    title: '新增/编辑养殖场',
                    hideInMenu: true,
                    permission: 'FARM'
                }
            },
            {
                path: 'AUDITD/detail/:id',
                name: 'auditdDetail',
                component: () => import('@/views/Review/details/ReviewDetail.vue'),
                props: (route) => ({
                    isViewMode: route.query.viewMode === 'true',
                    recordId: route.params.id
                }),
                meta: {
                    title: '审核详情',
                    hideInMenu: true,
                    permission: 'AUDITD'
                }
            },
            {
                path: 'AUDITD/super-detail/:id',
                name: 'superDetail',
                component: () => import('@/views/Review/details/SuperDetail.vue'),
                props: (route) => ({
                    recordId: route.params.id,
                    areaIndex: parseInt(route.query.area as string) || 0,
                    tabKey: route.query.tab as string || 'fattening'
                }),
                meta: {
                    title: '详细对比',
                    hideInMenu: true,
                    permission: 'AUDITD'
                }
            },
            {
                path: 'E-WARN',
                name: 'E-WARN',
                component: () => import('@/views/Warning/index.vue'),
                meta: {
                    title: '异常预警',
                    icon: WarningOutlined,
                    permission: 'E-WARN'
                }
            }
        ]
    }
];

const router = createRouter({
    history: createWebHashHistory('/'),
    routes: constantRoutes
});

// 记录是否已添加动态路由
let dynamicRoutesAdded = false;

// 根据菜单权限添加动态路由
export function addDynamicRoutes(menus: any[]) {
    if (dynamicRoutesAdded) return;
    
    // 获取用户拥有的菜单代码
    const menuCodes = menus.map(menu => menu.menuCode);
    
    // 过滤有权限的路由
    const filterRoutes = (routes: RouteRecordRaw[]) => {
        return routes.filter(route => {
            // 检查当前路由是否有权限要求
            if (route.meta?.permission) {
                return menuCodes.includes(route.meta.permission as string);
            }
            return true;
        });
    };
    
    // 过滤获取有权限的主路由
    const accessibleMainRoutes = asyncRoutes.find(route => route.name === 'Main');
    
    if (accessibleMainRoutes) {
        // 添加主路由
        router.addRoute(accessibleMainRoutes);
        
        // 过滤并添加子路由
        const accessibleChildRoutes = filterRoutes(accessibleMainRoutes.children || []);
        
        accessibleChildRoutes.forEach(route => {
            router.addRoute('Main', route);
        });
        
        // 添加通配符路由
        router.addRoute({
            path: '/:catchAll(.*)',
            redirect: '/404'
        });
        
        dynamicRoutesAdded = true;
    }
}

// 路由守卫
router.beforeEach((to, from, next) => {
    const isLoginPage = to.path === '/login';
    const token = sessionStorage.getItem('token');
    
    // 未登录且访问非登录页，重定向到登录页
    if (!token && !isLoginPage) {
        next('/login');
        return;
    }
    
    // 已登录访问登录页，重定向到有权限的第一个菜单
    if (token && isLoginPage) {
        const userMenus = JSON.parse(sessionStorage.getItem('menus') || '[]');
        if (userMenus.length > 0) {
            next(`/${userMenus[0].menuCode}`);
        } else {
            next('/login'); // 没有菜单权限，返回登录页
        }
        return;
    }
    
    // 已登录但还未添加动态路由
    if (token && !dynamicRoutesAdded && to.path !== '/login') {
        const userMenus = JSON.parse(sessionStorage.getItem('menus') || '[]');
        addDynamicRoutes(userMenus);
        
        // 添加完路由后，重定向到目标页面以确保能正确匹配
        next({ ...to, replace: true });
        return;
    }
    
    // 检查是否有权限访问该路由
    if (token && to.meta?.permission) {
        const userMenus = JSON.parse(sessionStorage.getItem('menus') || '[]');
        const menuCodes = userMenus.map((menu: any) => menu.menuCode);
        
        if (menuCodes.includes(to.meta.permission as string)) {
            next();
        } else {
            next('/404');
        }
        return;
    }
    
    next();
});

export default router;