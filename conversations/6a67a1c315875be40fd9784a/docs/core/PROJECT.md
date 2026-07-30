# Project Charter: LMS Integration Platform

## Purpose
The primary purpose of this project is to build a contract-first, programmable book and course content pipeline for LMS (Learning Management System) platforms. It enables automated authoring, synchronization, and management of educational content across diverse LMS vendor systems through a unified, canonical interface.

## Scope
- **Initial Scope**: Primary focus on the **ProgressMe / Edvibe** platform, using its private WebSocket RPC protocol as the first deep integration adapter.
- **Designed for Expansion**: The platform is architected with clear adapter and domain boundaries to easily expand to additional LMS targets (e.g., Canvas, Moodle, custom LMS platforms) without refactoring the core domain logic or content pipeline.

## Core Principles
1. **Contract-First Development**: API specifications (AsyncAPI, OpenAPI, JSON Schema) precede code implementation. Interfaces and data structures are formally defined before adapters or application code are written.
2. **Evidence-Based Integration**: Protocol mappings and schema definitions must be grounded in verified network captures, evidence files, or confirmed vendor behavior. No guesswork or invented schemas.
3. **Neutral Domain Model**: Application logic and business entities operate on vendor-agnostic models (Book, Course, Lesson, LessonSection, Exercise). Vendor-specific terminology and structures are isolated inside adapter boundaries.
4. **Adapter Isolation**: Vendor protocols (e.g., WebSocket frames, private REST endpoints, RPC formats) are contained within dedicated adapters. No vendor leaking occurs into core application or domain code.

## Current Project Status
- **Phase**: Scaffold stage / Initial Architecture & Design.
- **Research Baseline**: v1 research baseline complete.
- **Adapter Design**: First deep adapter (ProgressMe) is currently in design.
