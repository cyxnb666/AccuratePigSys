<template>
    <div class="info-section">
        <div class="section-header">
            <div class="title">养殖场基础信息</div>
        </div>
        <div class="basic-info">
            <div class="info-row">
                <div class="info-item">
                    <span class="label">行政区划:</span>
                    <span class="value">{{ farmInfo.district }}</span>
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
                    <span class="value">{{ farmInfo.address }}</span>
                </div>
            </div>
            <div class="info-row">
                <div class="info-item">
                    <span class="label">养殖场主要联系人:</span>
                    <span class="value">{{ farmInfo.contactPerson }} {{ farmInfo.contactPhone }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    farmInfo: {
        type: Object,
        required: true,
        default: () => ({
            district: '',
            farmName: '',
            address: '',
            contactPerson: '',
            contactPhone: ''
        })
    }
});
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