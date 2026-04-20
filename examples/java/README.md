# Java example (OkHttp)

```bash
cd examples/java
mvn compile
export TEXTORY_API_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxx
mvn exec:java -Dexec.mainClass=io.textory.examples.SendPhone
```

Or build a fat jar:

```bash
mvn package
java -jar target/textory-examples-1.0.jar
```
