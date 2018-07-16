#!/bin/sh

# 1.在运行脚本之前请在脚本运行目录下创建ExportOptions.plist

# 2.安装nodejs环境, npm, json解析命令行json数据

# 3.project, target, Scheme_Name, 根据targets 自己选择

# 4.在Macmini上安装打包证书provisioning file(证书一定要包含其他电脑的私钥)

# 5.Keychain_Password设置钥匙串密码

xcodebuildListResult=$(xcodebuild -list -json)
echo "xcodebuildListResult: ${xcodebuildListResult}"

# 获取工程名称
project=$(xcodebuild -list -json | json project)
echo "project: ${project}"

# 获取target名称
target=$(xcodebuild -list -json | json project.targets[1])
echo "target: ${target}"

# 获取app名称
App_Name=$(xcodebuild -list -json | json project.name)
echo "App_Name: ${App_Name}"

# 获取scheme
Scheme_Name=$(xcodebuild -list -json | json project.schemes[1])
echo "Scheme_Name: ${Scheme_Name}"

# 打包环境 - debug
Archive_Configuration="Debug"

# 钥匙串密码
Keychain_Password="123456"

# 当前路径
Current_Path=$(pwd)
echo "Current_Path: ${Current_Path}"

# 打包路径
Archive_Path="${Current_Path}/build/Debug-iphoneos/${App_Name}.xcarchive"
echo "Archive_Path: ${Archive_Path}"

# 导出ipa包路径
Export_Path="${Current_Path}/build/app_debug"
echo "Export_Path: ${Export_Path}"

Export_Option_Plist_Path="${Current_Path}/ExportOptions.plist"
echo "Export_Option_Plist_Path: ${Export_Option_Plist_Path}"


echo "Install cocoapod dependencies..."
pod install
echo "Install cocoapod dependencies success"

echo "Clean build..."
xcodebuild clean -workspace ${App_Name}.xcworkspace -scheme ${Scheme_Name}
echo "Clean build success"

# 解密钥匙串
security unlock-keychain -p ${Keychain_Password}

echo "Begin archive..."
xcodebuild -archivePath ${Archive_Path} -workspace ${App_Name}.xcworkspace -sdk iphoneos -scheme ${Scheme_Name} -configuration ${Archive_Configuration} archive
echo "Archive success"

echo "Export ipa file"
xcodebuild -exportArchive -archivePath ${Archive_Path} -exportPath ${Export_Path} -exportOptionsPlist ${Export_Option_Plist_Path} -allowProvisioningUpdates
echo "Export ipa file success"
