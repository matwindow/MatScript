Lets Use ' Insted of "!
```string
'Hello World'
```
Hmmm... Lets Use Say!
```MatS
Say('Hello World')
```
##### Log:
```log
Hello World
```

So, Were Gonna Have This:
```MatS
window. @@(For drawing pixels and other things!)
text. @@(For text operations, ex: text.join('Hello ','World','!'))
```
And for easyer text:
```MatS
@@+ is the plus sign OR text.join but better
Say('Welcome '+localvar.name+'!')

```
Vars gonna have this:
```MatS
locdef hello 'omg'
Say(localvar.hello)
```
##### Log:
```log
omg
```
Lets Add Errors!
```MatS
Say(omg)
```
##### log:
```log
\red\\glow\Error In Line 1;
\red\\glow\omg is not known.

```
We Will Have Your Own Errors!
```MatS
Say.error({stop:false,error:'You Farted!'})
```
##### log:
```log
\red\\glow\Error In Line 1;
\red\\glow\You Farted!

```
We Gonna Have Loops!
```MatS
loop(10){
Say('Hello Sir!')
}
#####Log:
```log
Hello Sir!
Hello Sir!
Hello Sir!
Hello Sir!
Hello Sir!
Hello Sir!
Hello Sir!
Hello Sir!
Hello Sir!
Hello Sir!
```
We Gonna Have Var Edits!
```MatS
locdef ok 0
loop(10){
localvar.ok = localvar.ok+1
Say(localvar.ok)
}
```
##### Log:
```log
1
2
3
4
5
6
7
8
9
10
```
