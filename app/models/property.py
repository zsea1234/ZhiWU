from app import db
from datetime import datetime
from enum import Enum

class PropertyStatus(str, Enum):
    """房产状态枚举"""
    VACANT = 'vacant'  # 空置
    RENTED = 'rented'  # 已出租
    MAINTENANCE = 'maintenance'  # 维护中

class Property(db.Model):
    """房产模型"""
    __tablename__ = 'properties'
    
    id = db.Column(db.Integer, primary_key=True)
    landlord_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)  # 房东ID
    title = db.Column(db.String(100), nullable=False)  # 标题
    description = db.Column(db.Text, nullable=True)  # 描述
    address_line1 = db.Column(db.String(255), nullable=False)  # 地址1
    address_line2 = db.Column(db.String(255), nullable=True)  # 地址2
    city = db.Column(db.String(100), nullable=False)  # 城市
    district = db.Column(db.String(100), nullable=False)  # 区/县
    postal_code = db.Column(db.String(20), nullable=True)  # 邮政编码
    property_type = db.Column(db.String(50), nullable=False)  # 房产类型
    area_sqm = db.Column(db.Float, nullable=False)  # 面积（平方米）
    bedrooms = db.Column(db.Integer, nullable=False)  # 卧室数量
    bathrooms = db.Column(db.Integer, nullable=False)  # 浴室数量
    rent_price_monthly = db.Column(db.Float, nullable=False)  # 月租金
    deposit_amount = db.Column(db.Float, nullable=False)  # 押金金额
    status = db.Column(db.String(20), nullable=False, default=PropertyStatus.VACANT.value)  # 状态
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # 创建时间
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)  # 更新时间
    is_deleted = db.Column(db.Boolean, nullable=False, default=False)  # 是否被逻辑删除
    deleted_at = db.Column(db.DateTime, nullable=True)  # 逻辑删除时间
    
    # 关联关系
    landlord = db.relationship('User', back_populates='properties')  # 房东
    media = db.relationship('PropertyMedia', back_populates='property_rel', lazy='joined')  # 媒体文件
    amenities = db.relationship('PropertyAmenity', back_populates='property', lazy='joined')  # 设施
    leases = db.relationship('Lease', back_populates='property', lazy='joined')  # 租约
    maintenance_requests = db.relationship('MaintenanceRequest', back_populates='property', lazy='joined')  # 维护请求
    
    def __repr__(self):
        return f'<Property {self.id}: {self.title}>'
    
    @property
    def main_image_url(self):
        """获取主图片URL"""
        # 获取未删除的图片类型媒体，按排序顺序排序
        main_image = next(
            (media for media in self.media 
             if not media.is_deleted and media.media_type == 'image'),
            None
        )
        return main_image.file_url if main_image else None
    
    def soft_delete(self):
        """软删除房产"""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
        return True 