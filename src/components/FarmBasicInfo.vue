<template>
    <div class="info-section">
        <div class="section-header">
            <div class="title">养殖场基础信息</div>
            <div v-if="showDetailButton" class="detail-link">
                <a @click="$emit('view-detail')">详情 <right-outlined /></a>
            </div>
        </div>
        <div class="basic-info">
            <div class="info-row">
                <div class="info-item">
                    <span class="label">行政区划:</span>
                    <span class="value">{{ farmInfo.provinceName }} {{ farmInfo.cityName }} {{ farmInfo.townName }} {{
                        farmInfo.districtName }}</span>
                </div>
            </div>
            <div class="info-row">
                <div class="info-item">
                    <span class="label">养殖场名称:</span>
                    <span class="value">{{ farmInfo.farmName }}</span>
                </div>
            </div>
            <div class="info-row">
                <div class="info-item">
                    <span class="label">养殖场地址:</span>
                    <span class="value">{{ farmInfo.farmAddress }}</span>
                </div>
            </div>
            <div class="info-row">
                <div class="info-item">
                    <span class="label">养殖场备注:</span>
                    <span class="value">{{ farmInfo.remark }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { RightOutlined } from '@ant-design/icons-vue';
defineProps({
    farmInfo: {
        type: Object,
        required: true,
        default: () => ({
            provinceName: '',
            cityName: '',
            townName: '',
            districtName: '',
            farmName: '',
            farmAddress: '',
            remark: ''
        })
    },
    showDetailButton: {
        type: Boolean,
        default: false
    }
});
defineEmits(['view-detail']);
</script>

<style lang="scss" scoped>
.info-section {
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .title {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            position: relative;
            padding-left: 10px;

            &:before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 4px;
                height: 16px;
                background-color: #5276E5;
                border-radius: 2px;
            }
        }

        .detail-link {
            a {
                color: #5276E5;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
            }
        }
    }

    .basic-info {
        .info-row {
            display: flex;
            margin-bottom: 16px;

            .info-item {
                flex: 1;
                display: flex;

                .label {
                    color: #666;
                    width: 150px;
                    text-align: right;
                    padding-right: 16px;
                }

                .value {
                    flex: 1;
                    color: #333;
                }
            }
        }
    }
}
</style>