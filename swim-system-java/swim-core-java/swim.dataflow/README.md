# swim-dataflow

[![package](https://img.shields.io/maven-central/v/org.swimos/swim-util?label=maven)](https://mvnrepository.com/artifact/org.swimos/swim-dataflow)
[![documentation](https://img.shields.io/badge/doc-JavaDoc-blue.svg)](https://docs.swimos.org/java/latest/swim.dataflow/module-summary.html)
[![chat](https://img.shields.io/badge/chat-Gitter-green.svg)](https://gitter.im/swimos/community)

<a href="https://www.swimos.org"><img src="https://docs.swimos.org/readme/marlin-blue.svg" align="left"></a>

**swim-dataflow** implements a compiler from
[**swim-structure**](https://github.com/swimos/swim/tree/master/swim-system-java/swim-core-java/swim.structure)
selectors, operators, and functions, to continuously updated data structures
driven by [**swim-streamlet**](https://github.com/swimos/swim/tree/master/swim-system-java/swim-core-java/swim.streamlet)
dataflow graphs.  **swim-dataflow** is part of the
[**Swim Core**](https://github.com/swimos/swim/tree/master/swim-system-java/swim-core-java) framework.

## Usage

Add the **swim-dataflow** library to your project's dependencies.

### Gradle

```groovy
compile group: 'org.swimos', name: 'swim-dataflow', version: '3.10.0'
```

### Maven

```xml
<dependency>
  <groupId>org.swimos</groupId>
  <artifactId>swim-dataflow</artifactId>
  <version>3.10.0</version>
</dependency>
```
