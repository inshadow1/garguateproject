<template>
	<view class="container">
		<!-- #ifdef APP-PLUS -->
		<map
			id="map"
			class="map"
			:latitude="latitude"
			:longitude="longitude"
			:markers="markers"
			@tap="handleMapTap"
			@markertap="handleMarkerTap"
			show-location
		></map>
		<!-- #endif -->
		
		<!-- #ifdef H5 -->
		<view id="container" class="map"></view>
		<!-- #endif -->
		
		<view class="search-box">
			<input 
				type="text" 
				v-model="keyword"
				placeholder="搜索地点"
				@confirm="searchLocation"
			/>
		</view>
		
		<scroll-view 
			class="poi-list"
			v-if="poiList.length > 0"
			scroll-y
		>
			<view 
				class="poi-item"
				v-for="(item, index) in poiList"
				:key="index"
				@tap="selectLocation(item)"
			>
				<text class="name">{{item.name}}</text>
				<text class="address">{{item.address}}</text>
			</view>
		</scroll-view>
		
		<view class="bottom-bar">
			<button class="confirm-btn" @click="confirmLocation" :disabled="!selectedLocation">
				确定选择
			</button>
		</view>
	</view>
</template>

<script>
const amapKey = 'fbed83ec9f299f92682bddbb09eb02e3'
const amapSecurityJsCode = 'aeda0af4cc0245e3fc9c1ab7dbf63d1e'

export default {
	data() {
		return {
			latitude: 39.909,
			longitude: 116.397,
			keyword: '',
			poiList: [],
			markers: [],
			selectedLocation: null,
			// #ifdef H5
			map: null,
			// #endif
		}
	},
	// #ifdef H5
	async mounted() {
		await this.initAMap()
	},
	// #endif
	onLoad() {
		// #ifdef APP-PLUS
		this.getCurrentLocation()
		// #endif
	},
	methods: {
		// #ifdef H5
		async initAMap() {
			try {
				// 动态加载高德地图脚本
				await this.loadAMapScript()
				
				// 创建地图实例
				this.map = new AMap.Map('container', {
					zoom: 15,
					center: [this.longitude, this.latitude],
					resizeEnable: true
				})
				
				// 创建地理编码器
				this.geocoder = new AMap.Geocoder({
					city: "全国"
				})
				
				// 添加定位控件
				const geolocation = new AMap.Geolocation({
					enableHighAccuracy: true,
					timeout: 10000,
					buttonPosition: 'RB',
					buttonOffset: new AMap.Pixel(10, 20),
					zoomToAccuracy: true
				})
				this.map.addControl(geolocation)
				
				// 监听点击事件
				this.map.on('click', (e) => {
					const lnglat = e.lnglat
					this.reverseGeocode(lnglat.getLat(), lnglat.getLng())
				})
				
				await this.getCurrentLocation()
			} catch (error) {
				console.error('初始化地图失败:', error)
				uni.showToast({
					title: '初始化地图失败',
					icon: 'none'
				})
			}
		},
		
		loadAMapScript() {
			return new Promise((resolve, reject) => {
				if (window.AMap) {
					resolve()
					return
				}
				
				// 先加载安全配置
				window._AMapSecurityConfig = {
					securityJsCode: amapSecurityJsCode
				}
				
				// 加载地图主脚本
				const mapScript = document.createElement('script')
				mapScript.type = 'text/javascript'
				mapScript.async = false
				mapScript.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.Geolocation,AMap.PlaceSearch,AMap.Geocoder`
				
				mapScript.onload = () => {
					if (window.AMap) {
						resolve()
					} else {
						reject(new Error('AMap is not loaded'))
					}
				}
				
				mapScript.onerror = () => {
					reject(new Error('Failed to load AMap script'))
				}
				
				document.head.appendChild(mapScript)
			})
		},
		
		updateH5Markers(pois) {
			// 清除现有标记
			if (this.map) {
				this.map.clearMap()
			}
			
			// 添加新标记
			pois.forEach(poi => {
				const [lng, lat] = poi.location.split(',')
				const marker = new AMap.Marker({
					position: [lng, lat],
					title: poi.name
				})
				
				// 添加信息窗体
				const infoWindow = new AMap.InfoWindow({
					content: `<div>
						<h4 style="margin:0;font-size:14px;">${poi.name}</h4>
						<p style="margin:5px 0 0;font-size:12px;color:#666;">${poi.address || ''}</p>
					</div>`,
					offset: new AMap.Pixel(0, -30)
				})
				
				// 点击标记时显示信息窗体并选中位置
				marker.on('click', () => {
					infoWindow.open(this.map, marker.getPosition())
					this.selectLocation(poi)
				})
				
				// 如果是选中的位置，直接显示信息窗体
				if (this.selectedLocation && this.selectedLocation.location === poi.location) {
					infoWindow.open(this.map, marker.getPosition())
				}
				
				this.map.add(marker)
			})
			
			// 如果有选中的位置，将地图中心移动到该位置
			if (this.selectedLocation) {
				const [lng, lat] = this.selectedLocation.location.split(',')
				this.map.setCenter([lng, lat])
			}
		},
		// #endif
		
		getCurrentLocation() {
			// #ifdef APP-PLUS
			uni.getLocation({
				type: 'gcj02',
				success: res => {
					this.latitude = res.latitude
					this.longitude = res.longitude
					this.searchNearby()
				},
				fail: () => {
					uni.showToast({
						title: '获取位置失败',
						icon: 'none'
					})
				}
			})
			// #endif
			
			// #ifdef H5
			if (this.map) {
				const geolocation = new AMap.Geolocation({
					enableHighAccuracy: true,
					timeout: 10000
				})
				
				this.map.addControl(geolocation)
				geolocation.getCurrentPosition((status, result) => {
					if (status === 'complete') {
						this.latitude = result.position.lat
						this.longitude = result.position.lng
						this.map.setCenter([this.longitude, this.latitude])
						this.searchNearby()
					} else {
						uni.showToast({
							title: '获取位置失败',
							icon: 'none'
						})
					}
				})
			}
			// #endif
		},
		
		async searchLocation() {
			if (!this.keyword) return
			
			try {
				const res = await uni.request({
					url: `https://restapi.amap.com/v3/place/text`,
					data: {
						key: amapKey,
						keywords: this.keyword,
						location: `${this.longitude},${this.latitude}`,
						offset: 20,
						page: 1,
						extensions: 'all'
					}
				})
				
				if (res.data.status === '1') {
					this.poiList = res.data.pois
					// #ifdef APP-PLUS
					this.updateMarkers(this.poiList)
					// #endif
					// #ifdef H5
					this.updateH5Markers(this.poiList)
					// #endif
				}
			} catch (e) {
				uni.showToast({
					title: '搜索失败',
					icon: 'none'
				})
			}
		},
		
		async searchNearby() {
			try {
				const res = await uni.request({
					url: `https://restapi.amap.com/v3/place/around`,
					data: {
						key: amapKey,
						location: `${this.longitude},${this.latitude}`,
						radius: 1000,
						offset: 20,
						page: 1,
						extensions: 'all'
					}
				})
				
				if (res.data.status === '1') {
					this.poiList = res.data.pois
					// #ifdef APP-PLUS
					this.updateMarkers(this.poiList)
					// #endif
					// #ifdef H5
					this.updateH5Markers(this.poiList)
					// #endif
				}
			} catch (e) {
				uni.showToast({
					title: '获取周边位置失败',
					icon: 'none'
				})
			}
		},
		
		// #ifdef APP-PLUS
		updateMarkers(pois) {
			this.markers = pois.map((poi, index) => {
				const [longitude, latitude] = poi.location.split(',')
				return {
					id: index,
					latitude: Number(latitude),
					longitude: Number(longitude),
					title: poi.name,
					width: 32,
					height: 32,
					callout: {
						content: poi.name,
						padding: 10,
						borderRadius: 4,
						display: 'ALWAYS'
					}
				}
			})
		},
		
		handleMarkerTap(e) {
			const marker = this.markers[e.detail.markerId]
			if (marker) {
				const poi = this.poiList[e.detail.markerId]
				if (poi) {
					this.selectLocation(poi)
				}
			}
		},
		// #endif
		
		selectLocation(location) {
			this.selectedLocation = location
			const [longitude, latitude] = location.location.split(',')
			this.latitude = Number(latitude)
			this.longitude = Number(longitude)
			
			// #ifdef APP-PLUS
			this.markers = [{
				id: 0,
				latitude: Number(latitude),
				longitude: Number(longitude),
				title: location.name,
				width: 32,
				height: 32,
				callout: {
					content: location.name,
					padding: 10,
					borderRadius: 4,
					display: 'ALWAYS'
				}
			}]
			// #endif
			
			// #ifdef H5
			this.updateH5Markers([location])
			// #endif
		},
		
		confirmLocation() {
			if (!this.selectedLocation) return
			
			const pages = getCurrentPages()
			const prevPage = pages[pages.length - 2]
			
			// 更新上一页的位置信息
			prevPage.$vm.updateLocation({
				name: this.selectedLocation.name,
				address: this.selectedLocation.address,
				location: this.selectedLocation.location
			})
			
			uni.navigateBack()
		},
		
		handleMapTap(e) {
			// #ifdef APP-PLUS
			const { latitude, longitude } = e.detail
			// #endif
			
			// #ifdef H5
			const lnglat = e.lnglat
			const latitude = lnglat.getLat()
			const longitude = lnglat.getLng()
			// #endif
			
			this.reverseGeocode(latitude, longitude)
		},
		
		async reverseGeocode(latitude, longitude) {
			try {
				// 使用高德地图的地理编码器
				this.geocoder.getAddress([longitude, latitude], (status, result) => {
					if (status === 'complete' && result.info === 'OK') {
						const addressComponent = result.regeocode.addressComponent
						const poi = {
							name: result.regeocode.formattedAddress,
							address: (addressComponent.district || '') + 
								(addressComponent.township || '') + 
								(addressComponent.street || '') + 
								(addressComponent.streetNumber || ''),
							location: `${longitude},${latitude}`
						}
						this.selectedLocation = poi
						this.poiList = [poi]
						// #ifdef APP-PLUS
						this.updateMarkers([poi])
						// #endif
						// #ifdef H5
						this.updateH5Markers([poi])
						// #endif
					} else {
						uni.showToast({
							title: '获取位置信息失败',
							icon: 'none'
						})
					}
				})
			} catch (e) {
				uni.showToast({
					title: '获取位置信息失败',
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style>
.container {
	height: 100vh;
	position: relative;
}

.map {
	width: 100%;
	height: 100%;
}

.search-box {
	position: absolute;
	top: 20rpx;
	left: 20rpx;
	right: 20rpx;
	z-index: 1;
}

.search-box input {
	width: 100%;
	height: 80rpx;
	background: #fff;
	border-radius: 40rpx;
	padding: 0 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.poi-list {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 120rpx;
	max-height: 50vh;
	background: #fff;
	border-radius: 24rpx 24rpx 0 0;
	padding: 20rpx;
}

.poi-item {
	padding: 20rpx;
	border-bottom: 1rpx solid #eee;
}

.poi-item:last-child {
	border-bottom: none;
}

.poi-item .name {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 6rpx;
	display: block;
}

.poi-item .address {
	font-size: 24rpx;
	color: #999;
}

.bottom-bar {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 20rpx;
	padding: 20rpx;
	background: #fff;
}

.confirm-btn {
	background: #007AFF;
	color: #fff;
}

.confirm-btn[disabled] {
	background: #ccc;
}
</style> 