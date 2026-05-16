# 餐饮收银系统实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个单门店餐饮收银系统，支持扫码点餐、收银管理、第三方订单聚合（美团/饿了么/抖音）、会员管理

**Architecture:** 
- 后端: Spring Boot REST API
- 前端: Electron + Vue 3 (收银客户端) + Vue 3 + Element Plus (管理后台)
- 数据库: MySQL 8.0 + Redis
- 第三方: 微信/支付宝支付、美团/饿了么/抖音开放平台

**Tech Stack:** Java (Spring Boot 3.x), Vue 3, Electron, MySQL, Redis

---

## 阶段一：项目基础搭建 (Week 1-2)

### Task 1.1: 初始化项目结构

**Files:**
- Create: `backend/pom.xml`
- Create: `frontend/pom.xml`
- Create: `docs/deployment-guide.md`

- [ ] **Step 1: 创建后端Maven项目结构**

```xml
<!-- backend/pom.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.restaurant</groupId>
    <artifactId>restaurant-pos</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>
```

- [ ] **Step 2: 创建application.yml配置**

```yaml
# backend/src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/restaurant_pos?useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  data:
    redis:
      host: localhost
      port: 6379
server:
  port: 8080
```

- [ ] **Step 3: 创建主应用类**

```java
package com.restaurant.pos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RestaurantPosApplication {
    public static void main(String[] args) {
        SpringApplication.run(RestaurantPosApplication.class, args);
    }
}
```

- [ ] **Step 4: 提交代码**

```bash
git add backend/
git commit -m "feat: 初始化Spring Boot项目结构"
```

---

### Task 1.2: 数据库表设计

**Files:**
- Create: `backend/src/main/resources/schema.sql`

- [ ] **Step 1: 创建数据库表SQL**

```sql
-- 菜品分类表
CREATE TABLE category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 菜品表
CREATE TABLE dish (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category_id BIGINT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    description VARCHAR(500),
    status TINYINT DEFAULT 1, -- 1: 上架 0: 下架
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(id)
);

-- 桌位表
CREATE TABLE restaurant_table (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    table_number VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 4,
    status TINYINT DEFAULT 0, -- 0: 空闲 1: 使用中
    qr_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    table_id BIGINT,
    order_type TINYINT DEFAULT 1, -- 1: 扫码点餐 2: 收银点餐 3: 美团 4: 饿了么 5: 抖音
    total_amount DECIMAL(10,2) DEFAULT 0,
    status TINYINT DEFAULT 1, -- 1: 进行中 2: 已完成 3: 已取消
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES restaurant_table(id)
);

-- 订单明细表
CREATE TABLE order_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    dish_id BIGINT NOT NULL,
    dish_name VARCHAR(100),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    remark VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (dish_id) REFERENCES dish(id)
);

-- 支付表
CREATE TABLE payment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    payment_method VARCHAR(20), -- cash, wechat, alipay, member_card
    amount DECIMAL(10,2) NOT NULL,
    status TINYINT DEFAULT 1, -- 1: 待支付 2: 已支付 3: 已退款
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 会员表
CREATE TABLE member (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(50),
    balance DECIMAL(10,2) DEFAULT 0,
    points INT DEFAULT 0,
    level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 第三方订单表
CREATE TABLE third_party_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    platform_order_id VARCHAR(50) NOT NULL,
    platform VARCHAR(20), -- meituan, ele, douyin
    order_id BIGINT,
    status VARCHAR(20),
    raw_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

- [ ] **Step 2: 提交代码**

```bash
git add backend/src/main/resources/schema.sql
git commit -m "feat: 添加数据库表设计"
```

---

## 阶段二：菜品与分类管理 (Week 2)

### Task 2.1: 分类管理API

**Files:**
- Create: `backend/src/main/java/com/restaurant/pos/entity/Category.java`
- Create: `backend/src/main/java/com/restaurant/pos/repository/CategoryRepository.java`
- Create: `backend/src/main/java/com/restaurant/pos/controller/CategoryController.java`

- [ ] **Step 1: 创建Category实体类**

```java
package com.restaurant.pos.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "category")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

- [ ] **Step 2: 创建CategoryRepository**

```java
package com.restaurant.pos.repository;

import com.restaurant.pos.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByOrderBySortOrderAsc();
}
```

- [ ] **Step 3: 创建CategoryController**

```java
package com.restaurant.pos.controller;

import com.restaurant.pos.entity.Category;
import com.restaurant.pos.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/category")
@CrossOrigin
public class CategoryController {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @GetMapping
    public List<Category> getAll() {
        return categoryRepository.findAllByOrderBySortOrderAsc();
    }
    
    @PostMapping
    public Category create(@RequestBody Category category) {
        return categoryRepository.save(category);
    }
    
    @PutMapping("/{id}")
    public Category update(@PathVariable Long id, @RequestBody Category category) {
        category.setId(id);
        return categoryRepository.save(category);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        categoryRepository.deleteById(id);
    }
}
```

- [ ] **Step 4: 提交代码**

```bash
git add backend/src/main/java/com/restaurant/pos/
git commit -m "feat: 添加分类管理API"
```

---

### Task 2.2: 菜品管理API

**Files:**
- Create: `backend/src/main/java/com/restaurant/pos/entity/Dish.java`
- Create: `backend/src/main/java/com/restaurant/pos/repository/DishRepository.java`
- Create: `backend/src/main/java/com/restaurant/pos/controller/DishController.java`

- [ ] **Step 1: 创建Dish实体类**

```java
package com.restaurant.pos.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "dish")
public class Dish {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "category_id", nullable = false)
    private Long categoryId;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    private String image;
    
    private String description;
    
    @Column(nullable = false)
    private Integer status = 1;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

- [ ] **Step 2: 创建DishRepository**

```java
package com.restaurant.pos.repository;

import com.restaurant.pos.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DishRepository extends JpaRepository<Dish, Long> {
    List<Dish> findByCategoryId(Long categoryId);
    List<Dish> findByStatus(Integer status);
}
```

- [ ] **Step 3: 创建DishController**

```java
package com.restaurant.pos.controller;

import com.restaurant.pos.entity.Dish;
import com.restaurant.pos.repository.DishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dish")
@CrossOrigin
public class DishController {
    
    @Autowired
    private DishRepository dishRepository;
    
    @GetMapping
    public List<Dish> getAll(@RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return dishRepository.findByCategoryId(categoryId);
        }
        return dishRepository.findAll();
    }
    
    @GetMapping("/available")
    public List<Dish> getAvailable() {
        return dishRepository.findByStatus(1);
    }
    
    @PostMapping
    public Dish create(@RequestBody Dish dish) {
        return dishRepository.save(dish);
    }
    
    @PutMapping("/{id}")
    public Dish update(@PathVariable Long id, @RequestBody Dish dish) {
        dish.setId(id);
        return dishRepository.save(dish);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        dishRepository.deleteById(id);
    }
}
```

- [ ] **Step 4: 提交代码**

```bash
git add backend/src/main/java/com/restaurant/pos/
git commit -m "feat: 添加菜品管理API"
```

---

## 阶段三：桌位与订单管理 (Week 3)

### Task 3.1: 桌位管理

**Files:**
- Create: `backend/src/main/java/com/restaurant/pos/entity/RestaurantTable.java`
- Create: `backend/src/main/java/com/restaurant/pos/repository/TableRepository.java`
- Create: `backend/src/main/java/com/restaurant/pos/controller/TableController.java`

- [ ] **Step 1: 创建桌位实体和API (代码结构类似前述Entity/Repository/Controller)**

- [ ] **Step 2: 提交代码**

```bash
git commit -m "feat: 添加桌位管理API"
```

---

### Task 3.2: 订单管理

**Files:**
- Create: `backend/src/main/java/com/restaurant/pos/entity/Order.java`
- Create: `backend/src/main/java/com/restaurant/pos/entity/OrderItem.java`
- Create: `backend/src/main/java/com/restaurant/pos/repository/OrderRepository.java`
- Create: `backend/src/main/java/com/restaurant/pos/service/OrderService.java`
- Create: `backend/src/main/java/com/restaurant/pos/controller/OrderController.java`

- [ ] **Step 1: 创建Order和OrderItem实体**

- [ ] **Step 2: 创建OrderService业务逻辑**

```java
package com.restaurant.pos.service;

import com.restaurant.pos.entity.Order;
import com.restaurant.pos.entity.OrderItem;
import com.restaurant.pos.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Transactional
    public Order createOrder(Order order) {
        // 计算订单总金额
        double total = order.getItems().stream()
            .mapToDouble(item -> item.getUnitPrice().doubleValue() * item.getQuantity())
            .sum();
        order.setTotalAmount(BigDecimal.valueOf(total));
        return orderRepository.save(order);
    }
    
    public List<Order> getActiveOrders() {
        return orderRepository.findByStatus(1);
    }
    
    public Order updateOrderStatus(Long orderId, Integer status) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
```

- [ ] **Step 3: 提交代码**

```bash
git commit -m "feat: 添加订单管理API"
```

---

## 阶段四：支付功能 (Week 3-4)

### Task 4.1: 支付接口

**Files:**
- Create: `backend/src/main/java/com/restaurant/pos/service/PaymentService.java`
- Create: `backend/src/main/java/com/restaurant/pos/controller/PaymentController.java`

- [ ] **Step 1: 创建PaymentService**

```java
package com.restaurant.pos.service;

import com.restaurant.pos.entity.Payment;
import com.restaurant.pos.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    public Payment createPayment(Long orderId, String method, BigDecimal amount) {
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setPaymentMethod(method);
        payment.setAmount(amount);
        payment.setStatus(1); // 待支付
        return paymentRepository.save(payment);
    }
    
    public Payment confirmPayment(Long paymentId, String transactionId) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        payment.setStatus(2); // 已支付
        payment.setTransactionId(transactionId);
        return paymentRepository.save(payment);
    }
}
```

- [ ] **Step 2: 提交代码**

```bash
git commit -m "feat: 添加支付功能API"
```

---

## 阶段五：第三方订单聚合 (Week 4-5)

### Task 5.1: 美团订单对接

**Files:**
- Create: `backend/src/main/java/com/restaurant/pos/thirdparty/meituan/MeituanClient.java`
- Create: `backend/src/main/java/com/restaurant/pos/thirdparty/meituan/MeituanOrderService.java`

- [ ] **Step 1: 创建美团API客户端**

```java
package com.restaurant.pos.thirdparty.meituan;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.Map;

@Component
public class MeituanClient {
    private static final String API_URL = "https://api.meituan.com";
    private String appKey;
    private String secret;
    
    public void init(String appKey, String secret) {
        this.appKey = appKey;
        this.secret = secret;
    }
    
    public Map<String, Object> fetchOrders() {
        // 调用美团开放平台API获取订单
        // 需要签名验证
        Map<String, Object> result = new HashMap<>();
        // TODO: 实现实际API调用
        return result;
    }
    
    public boolean acceptOrder(String orderId) {
        // 接单
        return true;
    }
    
    public boolean rejectOrder(String orderId, String reason) {
        // 拒单
        return true;
    }
}
```

- [ ] **Step 2: 提交代码**

```bash
git commit -m "feat: 添加美团订单对接"
```

---

### Task 5.2: 饿了么订单对接

**Files:**
- Create: `backend/src/main/java/com/restaurant/pos/thirdparty/ele/EleClient.java`

- [ ] **Step 1: 创建饿了么API客户端 (类似美团)**

- [ ] **Step 2: 提交代码**

```bash
git commit -m "feat: 添加饿了么订单对接"
```

---

### Task 5.3: 抖音订单对接

**Files:**
- Create: `backend/src/main/java/com/restaurant/pos/thirdparty/douyin/DouyinClient.java`

- [ ] **Step 1: 创建抖音API客户端**

- [ ] **Step 2: 提交代码**

```bash
git commit -m "feat: 添加抖音订单对接"
```

---

## 阶段六：会员系统 (Week 5-6)

### Task 6.1: 会员管理

**Files:**
- Create: `backend/src/main/java/com/restaurant/pos/entity/Member.java`
- Create: `backend/src/main/java/com/restaurant/pos/repository/MemberRepository.java`
- Create: `backend/src/main/java/com/restaurant/pos/service/MemberService.java`
- Create: `backend/src/main/java/com/restaurant/pos/controller/MemberController.java`

- [ ] **Step 1: 创建会员相关代码**

```java
@Service
public class MemberService {
    
    public Member register(String phone, String name) {
        Member member = new Member();
        member.setPhone(phone);
        member.setName(name);
        member.setBalance(BigDecimal.ZERO);
        member.setPoints(0);
        member.setLevel(1);
        return memberRepository.save(member);
    }
    
    public void addPoints(Long memberId, int points) {
        Member member = memberRepository.findById(memberId).orElseThrow();
        member.setPoints(member.getPoints() + points);
        // 检查是否升级
        if (member.getPoints() > 1000) member.setLevel(2);
        if (member.getPoints() > 5000) member.setLevel(3);
        memberRepository.save(member);
    }
    
    public boolean pay(Long memberId, BigDecimal amount) {
        Member member = memberRepository.findById(memberId).orElseThrow();
        if (member.getBalance().compareTo(amount) >= 0) {
            member.setBalance(member.getBalance().subtract(amount));
            addPoints(memberId, amount.intValue());
            memberRepository.save(member);
            return true;
        }
        return false;
    }
}
```

- [ ] **Step 2: 提交代码**

```bash
git commit -m "feat: 添加会员管理功能"
```

---

## 阶段七：前端收银客户端 (Week 6-7)

### Task 7.1: Electron + Vue项目搭建

**Files:**
- Create: `frontend/electron/package.json`
- Create: `frontend/electron/vite.config.ts`
- Create: `frontend/electron/src/main.ts`

- [ ] **Step 1: 创建Electron项目**

```json
{
  "name": "restaurant-pos-client",
  "version": "1.0.0",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build && electron-builder",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "element-plus": "^2.5.0",
    "axios": "^1.6.0",
    "pinia": "^2.1.0",
    "electron-log": "^5.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0"
  }
}
```

- [ ] **Step 2: 提交代码**

```bash
git add frontend/
git commit -m "feat: 添加Electron收银客户端"
```

---

### Task 7.2: 收银客户端页面

**Files:**
- Create: `frontend/electron/src/views/PosView.vue`
- Create: `frontend/electron/src/views/OrderView.vue`

- [ ] **Step 1: 创建收银主页面**

```vue
<template>
  <div class="pos-container">
    <div class="left-panel">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="点餐" name="order">
          <DishList :dishes="dishes" @add="addToCart" />
        </el-tab-pane>
        <el-tab-pane label="订单" name="orders">
          <OrderList :orders="activeOrders" />
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="right-panel">
      <Cart :items="cartItems" @checkout="handleCheckout" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DishList from './components/DishList.vue';
import Cart from './components/Cart.vue';
import axios from 'axios';

const dishes = ref([]);
const cartItems = ref([]);
const activeOrders = ref([]);

onMounted(async () => {
  const res = await axios.get('http://localhost:8080/api/dish/available');
  dishes.value = res.data;
});

function addToCart(dish) {
  const existing = cartItems.value.find(item => item.id === dish.id);
  if (existing) {
    existing.quantity++;
  } else {
    cartItems.value.push({ ...dish, quantity: 1 });
  }
}

async function handleCheckout() {
  // 调用结账API
}
</script>

<style scoped>
.pos-container { display: flex; height: 100vh; }
.left-panel { flex: 2; padding: 20px; }
.right-panel { flex: 1; background: #f5f5f5; padding: 20px; }
</style>
```

- [ ] **Step 2: 提交代码**

```bash
git commit -m "feat: 添加收银客户端页面"
```

---

## 阶段八：扫码点餐H5 (Week 7-8)

### Task 8.1: 微信点餐页面

**Files:**
- Create: `frontend/h5/index.html`
- Create: `frontend/h5/src/App.vue`
- Create: `frontend/h5/src/views/MenuView.vue`

- [ ] **Step 1: 创建H5点餐页面**

```vue
<template>
  <div class="menu-page">
    <div class="header">扫码点餐</div>
    <div class="categories">
      <div 
        v-for="cat in categories" 
        :key="cat.id"
        :class="{ active: currentCategory === cat.id }"
        @click="currentCategory = cat.id"
      >
        {{ cat.name }}
      </div>
    </div>
    <div class="dishes">
      <div v-for="dish in filteredDishes" :key="dish.id" class="dish-card">
        <img :src="dish.image" />
        <div class="info">
          <div class="name">{{ dish.name }}</div>
          <div class="price">¥{{ dish.price }}</div>
          <el-button @click="addToCart(dish)">加入购物车</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 类似收银客户端，但针对移动端优化
</script>

<style scoped>
.menu-page { padding-bottom: 80px; }
.dish-card { display: flex; margin: 10px; padding: 10px; background: #fff; border-radius: 8px; }
</style>
```

- [ ] **Step 2: 提交代码**

```bash
git commit -m "feat: 添加扫码点餐H5页面"
```

---

## 阶段九：部署与测试 (Week 8-9)

### Task 9.1: 打包部署

**Files:**
- Modify: `frontend/electron/package.json`
- Create: `deploy/install.bat`

- [ ] **Step 1: 创建Windows安装脚本**

```bat
@echo off
echo Installing Restaurant POS...

:: 安装MySQL
echo Installing MySQL...
:: ...

:: 安装Redis
echo Installing Redis...
:: ...

:: 启动后端服务
echo Starting backend service...
start java -jar restaurant-pos-backend.jar

:: 安装收银客户端
echo Installing POS client...
start /wait restaurant-pos-setup.exe

echo Installation complete!
pause
```

- [ ] **Step 2: 提交代码**

```bash
git add deploy/
git commit -m "feat: 添加部署脚本"
```

---

## 开发里程碑

| 阶段 | 任务 | 预计周数 |
|------|------|----------|
| 1 | 项目基础搭建 | 2周 |
| 2 | 菜品与分类管理 | 1周 |
| 3 | 桌位与订单管理 | 1周 |
| 4 | 支付功能 | 1周 |
| 5 | 第三方订单聚合 | 2周 |
| 6 | 会员系统 | 1周 |
| 7 | 前端收银客户端 | 2周 |
| 8 | 扫码点餐H5 | 1周 |
| 9 | 部署与测试 | 1周 |

**预计总周期**: 12周

---

> **下一步**: 需要我开始实施这个计划吗？