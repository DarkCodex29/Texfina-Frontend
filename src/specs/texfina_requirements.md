# TEXFINA - Desarrollo Web Etiquetado y Pesaje

## Control de Cambio

| Versión | Descripción | Fecha de Cambio | Modificado | Revisado |
|---------|-------------|----------------|------------|----------|
| v1.0 | Generación de Documento | 02/05/2025 | Gianpierre Collazos | Andersson Astete |
| v1.1 | Generación de Documento | 09/05/2025 | Gianpierre Collazos | Andersson Astete |

## Información del Proyecto

- **Id Proyecto**: PYP_000007
- **Nombre de Proyecto**: Aplicación web de etiquetado y pesaje
- **Consultor MOBILE**: Gianpierre Collazos Mio
- **Módulo**: WEB
- **Fecha**: 09/05/2025
- **Versión**: 1.1

## Índice

1. [Introducción](#introducción)
   - 1.1. [Contexto](#contexto)
   - 1.2. [Objetivo General](#objetivo-general)
   - 1.3. [Objetivos Específicos](#objetivos-específicos)
2. [Alcance del Proyecto](#alcance-del-proyecto)
   - 2.1. [Funcionalidades Principales](#funcionalidades-principales)
   - 2.2. [Exclusiones](#exclusiones)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Flujo de procesos](#flujo-de-procesos)
5. [Historias de Usuario](#historias-de-usuario)

## 1. Introducción

### 1.1. Contexto

TEXFINA opera una tintorería industrial que gestiona grandes volúmenes de textiles. Actualmente, los procesos de recepción de colorantes, dilución, pesaje y aplicación en máquinas son manuales o poco integrados, lo que genera ineficiencias y errores en las partidas. La falta de un sistema centralizado dificulta la trazabilidad completa de los colorantes desde su compra hasta su uso en producción, afectando la calidad y consistencia de los productos.

### 1.2. Objetivo General

Desarrollar una plataforma web que optimice la gestión de colorantes en la tintorería industrial de TEXFINA, integrando balanzas digitales y máquinas de teñido, y centralizando la información en una base de datos segura para mejorar la trazabilidad, precisión y eficiencia operativa.

### 1.3. Objetivos Específicos

- Implementar un sistema de autenticación y autorización para acceso seguro
- Desarrollar un módulo de administración de usuarios y permisos
- Crear un módulo de recepción y validación de colorantes (polvo y líquidos)
- Integrar balanzas digitales para el pesaje preciso de colorantes
- Implementar un sistema de gestión de recetas y dilución de colorantes
- Centralizar la información en una base de datos para trazabilidad
- Optimizar la plataforma para uso en dispositivos RF con Android v6.0 en adelante

## 2. Alcance del Proyecto

### 2.1. Funcionalidades Principales

#### 1. Módulo de Autenticación y Autorización

- Inicio de sesión seguro con email y contraseña
- Gestión de perfiles y permisos según roles
- Registro de actividades (logs/bitácora de los inicios de sesión)

#### 2. Módulo de Administración de Usuarios

- Creación, edición y eliminación de usuarios
- Restablecimiento de contraseñas (Solo el administrador cambiar y los usuarios con correo empresarial - @texfina.com.pe)

#### 3. Módulo de Recepción de Colorantes

- Registro de compras y recepción de colorantes en polvo y líquido
- Validación de lotes con muestras y aprobación de laboratorio
- Generación de etiquetas de identificación mediante código de barras o QR para las cajas o bidones de colorantes según sus lotes

#### 4. Módulo validación de código de barras o QR

- Integración con las lectoras para el rápido escaneo

#### 5. Módulo de Pesaje e impresión

- Integración con balanzas digitales para pesaje preciso
- Registro automático del peso en la base de datos
- Generación de ticket según receta
  - **Formas de pesado:**
    - Pesado de insumo
    - Pesado de vale - único (desactivado y en fondo rojo)
- Registro de ticket e impresión de este

> **Nota:** El sistema será on-premise, es decir todo será alojado dentro de la empresa.

### 2.2. Exclusiones

El presente proyecto no contempla las siguientes funcionalidades y elementos:

- Integración con sistemas externos no especificados
- Acceso remoto o vía internet (solo intranet)
- Desarrollo de aplicaciones móviles adicionales, el sistema solo será responsive, no se trabajará en desarrollo mobile
- Migración de datos históricos, es decir, habilitaremos la funcionalidad de "carga masiva" pero el encargado su área será el responsable

## 3. Arquitectura del Sistema

La aplicación seguirá una arquitectura modular con los siguientes componentes:

- **Frontend**: Angular, diseño responsive
- **Backend**: .NET, API RESTful para comunicación
- **Base de Datos**: SQL Server, con modelo optimizado para consultas eficientes
- **Integraciones**:
  - Balanzas digitales para captura de peso
  - Impresoras
  - Lectora inalámbricas
- **Seguridad**: Autenticación por tokens, encriptación de datos sensibles
- **Despliegue**: Servidor local en la red interna de TEXFINA

## 4. Flujo de procesos

### 1. Proceso de Autenticación

- El usuario ingresa sus credenciales y se valida contra la base de datos
- Se genera un token para acceso según rol

### 2. Proceso de Recepción de Colorantes

- Se registra la compra y recepción de colorantes
- Se toman muestras y se envían al laboratorio para validación
- Una vez aprobado, se genera una etiqueta de identificación
- En caso no, pasaría a un estado de "No aprobado" para que no se pueda tener en cuenta en ningún proceso

### 3. Proceso de Pesaje

- Se escanea el código del colorante (Código de barras o QR)
- Se pesa automáticamente y se registra el peso

## 5. Historias de Usuario

### HU-01: Inicio de Sesión

**Como** usuario del sistema, **quiero** iniciar sesión con mis credenciales, **para** acceder a las funcionalidades del sistema según mi rol.

**Criterios de Aceptación:**
- El sistema debe permitir el ingreso de email y contraseña
- El sistema debe validar las credenciales contra la base de datos
- El sistema debe mostrar un mensaje de error si las credenciales son inválidas
- El sistema debe redirigir al usuario al dashboard correspondiente a su rol
- EXTRA: Usuarios simples -- sin correo empresarial (cerrar sesión a las 6 pm)

### HU-02: Gestión de Usuarios

**Como** administrador del sistema, **quiero** poder crear, editar y eliminar usuarios, **para** gestionar el acceso al sistema.

**Criterios de Aceptación:**
- El sistema debe permitir crear nuevos usuarios con información básica (nombre, email, contraseña, rol) y también crear usuarios sin email (solo creados por jefatura o supervisor o subadministrador)
- El sistema debe permitir editar la información de usuarios existentes
- El sistema debe permitir eliminar usuarios
- El sistema debe permitir restablecer contraseñas
- El sistema debe validar que los datos ingresados sean correctos

### HU-03: Registro de Recepción de Colorantes

**Como** operador del área de recepción, **quiero** registrar la recepción de colorantes en polvo, **para** validar su calidad y mantener un control de inventario.

**Criterios de Aceptación:**
- El sistema debe permitir ingresar:
  - Insumo
  - Código
  - Familia Proveedor
  - Precio, Presentación
  - Cantidad
  - Total
  - Lote
  - Costo total
  - Unidad de medida
  - Fecha de registro de colorante
  - Nº de orden de compra
  - Nº de guía de remisión
  - Muestra/producción
  - Fecha de vencimiento
- El sistema debe generar un código único para cada lote recibido
- El sistema debe registrar el estado inicial del lote como "Pendiente"
- El sistema debe mostrar un resumen de la recepción realizada

### HU-04: Validación de Lotes con Muestras

**Como** operador del área de recepción, **quiero** enviar muestras al laboratorio para validar lotes, **para** evitar el uso de colorantes incorrectos en producción.

**Criterios de Aceptación:**
- El sistema debe permitir registrar hasta 3 muestras por lote
- El sistema debe enviar una notificación al laboratorio para su evaluación
- El sistema debe actualizar el estado del lote a "Aprobado", "Concesionado" o "Rechazado" tras la validación
- El sistema debe bloquear el uso de lotes no aprobados en producción (tener en cuenta que El stock general no contempla los rechazados, pero si en el histórico)

### HU-05: Generación de Etiqueta de Identificación

**Como** operador del área de recepción, **quiero** generar una etiqueta de identificación para los lotes recibidos, **para** identificarlos durante el proceso.

**Criterios de Aceptación:**
- El sistema debe generar una etiqueta con el código del lote, fecha y estado
- El sistema debe enviar la orden de impresión a la impresora de etiquetas
- El sistema debe registrar la generación de la etiqueta en la base de datos

### HU-06: Consulta de Lote por Código

**Como** operador del área de pesaje, **quiero** consultar un lote por su código, **para** obtener su información y proceder al pesaje.

**Criterios de Aceptación:**
- El sistema debe permitir escanear o ingresar el código del lote
- El sistema debe mostrar la información del lote (proveedor, fecha, estado y fecha de vencimiento)
- El sistema debe indicar si el lote no existe o no está aprobado

### HU-07: Integración con Balanza Digital

**Como** operador del área de pesaje, **quiero** que el sistema se integre con la balanza digital, **para** capturar automáticamente el peso del colorante.

**Criterios de Aceptación:**
- El sistema debe establecer comunicación con la balanza digital
- El sistema debe capturar el peso en tiempo real
- El sistema debe mostrar el peso capturado en la interfaz
- El sistema debe permitir confirmar el peso capturado

### HU-08: Registro de Peso de Colorante

**Como** operador del área de pesaje, **quiero** registrar el peso del colorante, **para** mantener un control preciso del inventario.

**Criterios de Aceptación:**
- El sistema debe registrar el peso capturado de la balanza
- El sistema debe asociar el peso al lote correspondiente
- El sistema debe almacenar el registro en la base de datos
- El sistema debe mostrar confirmación del registro exitoso

### HU-09: Visualización de Histórico de Producción

**Como** supervisor, **quiero** visualizar el histórico de producciones realizadas, **para** tener control y trazabilidad de los lotes procesados.

**Criterios de Aceptación:**
- El sistema debe mostrar una lista de producciones realizadas
- El sistema debe permitir filtrar por fecha, lote o colorante
- El sistema debe mostrar detalles de cada producción (peso, receta, parámetros)
- El sistema debe permitir exportar la información a Excel

### HU-10: Gestión de Proveedores

**Como** administrador del sistema, **quiero** registrar y gestionar la información de los proveedores de colorantes, **para** mantener un control actualizado de los contactos y mejorar la trazabilidad. Teniendo en cuenta que un mismo colorante lo pueden vender 2 proveedores diferentes.

**Criterios de Aceptación:**
- El sistema debe permitir registrar datos del proveedor (empresa, RUC, contacto, email)
- El sistema debe permitir editar o eliminar proveedores existentes
- El sistema debe mostrar una lista de proveedores con filtros por nombre o RUC
- El sistema debe asociar cada lote recibido a un proveedor específico

### HU-11: Control de Inventario de Colorantes

**Como** operador del área de almacén, **quiero** visualizar y gestionar el inventario de colorantes, **para** evitar faltantes o excesos en producción.

**Criterios de Aceptación:**
- El sistema debe mostrar el inventario actual de colorantes por tipo y lote
- El sistema debe permitir registrar entradas y salidas de colorantes (considerar 3 almacenes)
- El sistema debe alertar cuando un colorante esté por debajo del nivel mínimo
- El sistema debe permitir exportar el inventario a Excel

### HU-12: Registro de Resultados del Laboratorio

**Como** técnico del laboratorio, **quiero** registrar los resultados de las muestras de lotes, **para** documentar la validación y autorizar su uso en producción.

**Criterios de Aceptación:**
- El sistema debe permitir registrar los resultados de cada muestra (aprobado/concesionado/rechazado)
- El sistema debe notificar al operador de recepción sobre el resultado, esta notificación aparecerá en el sistema mismo
- El sistema debe almacenar los resultados en la base de datos para trazabilidad
- El sistema debe generar un reporte con los resultados de las muestras

### HU-13: Generación de Reportes de Producción

**Como** supervisor del área de producción, **quiero** generar reportes detallados de producción, **para** analizar el rendimiento y tomar decisiones informadas.

**Criterios de Aceptación:**
- El sistema debe permitir generar reportes por fecha o lote
- El sistema debe incluir datos como peso usado, vale y fechas
- El sistema debe permitir exportar los reportes a Excel o PDF
- El sistema debe mostrar gráficos básicos (ej. cantidad de lotes procesados por día)

### HU-14: Gestión de Tipos de Colorantes

**Como** supervisor del área de producción, **quiero** gestionar los diferentes tipos de colorantes, **para** clasificarlos y facilitar su uso en recetas.

**Criterios de Aceptación:**
- El sistema debe permitir registrar tipos de colorantes con familia y subfamilia
- El sistema debe permitir editar o eliminar tipos de colorantes existentes
- El sistema debe mostrar una lista de colorantes disponibles para su selección
- El sistema debe asociar cada colorante a las recetas correspondientes