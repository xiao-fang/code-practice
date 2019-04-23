<#
.DESCRIPTION
    scripts the check and enable SMB in Windows or Windows Server

.LINK
    refer to [How to detect, enable and disable SMBv1, SMBv2, and SMBv3 in Windows and Windows Server]
    https://support.microsoft.com/en-us/help/2696547/detect-enable-disable-smbv1-smbv2-smbv3-in-windows-and-windows-server

.REFERENCES
    +---------------------------+-------+-------+
    | OS                        | Major | Minor |
    +---------------------------+-------+-------+
    | Windows 10                | 10    | 0     |
    | Windows Server 2019       | 10    | 0     |
    | Windows Server 2016       | 10    | 0     |
    | Windows 8.1               | 6     | 3     |
    | Windows Server 2012 R2    | 6     | 3     |
    | Windows 8                 | 6     | 2     |
    | Windows Server 2012       | 6     | 2     |
    | Windows 7                 | 6     | 1     |
    | Windows Server 2008 R2    | 6     | 1     |
    | Windows Server 2008       | 6     | 0     |
    | Windows Vista             | 6     | 0     |
    | Windows Server 2003 R2    | 5     | 2     |
    | Windows Server 2003       | 5     | 2     |
    | Windows XP 64-Bit Edition | 5     | 2     |
    | Windows XP                | 5     | 1     |
    | Windows 2000              | 5     | 0     |
    +---------------------------+-------+-------+

.NOTES
    Author: Edward Xiao
    Version: 1.0.0
#>

#Requires -RunAsAdministrator

$osVersion = [System.Environment]::OSVersion.Version
$majorVersion = $osVersion.Major
$minorVersion = $osVersion.Minor
$restartRequired = $true

# Windows Server 2012 R2 & 2016, Windows 8.1 & Windows 10
if (($majorVersion -eq 10 -and $minorVersion -eq 0) -or ($majorVersion -eq 6 -and $minorVersion -eq 3)) {
    $smb1 = Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol
    if ($smb1.State -ne "Enabled") {
        Enable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart
        $restartRequired = $true
    }

    $smb2 = Get-SmbServerConfiguration | Select EnableSMB2Protocol
    if ($smb2.EnableSMB2Protocol -ne $true) {
        Set-SmbServerConfiguration -EnableSMB2Protocol $true -Force
        $restartRequired = $true
    }
}

# Windows 8 & Windows Server 2012
if ($majorVersion -eq 6 -and $minorVersion -eq 2) {
    $smb1 = Get-SmbServerConfiguration | Select EnableSMB1Protocol
    if ($smb1.EnableSMB1Protocol -ne $true) {
        Set-SmbServerConfiguration -EnableSMB1Protocol $true -Force
        $restartRequired = $true
    }

    $smb2 = Get-SmbServerConfiguration | Select EnableSMB2Protocol
    if ($smb2.EnableSMB2Protocol -ne $true) {
        Set-SmbServerConfiguration -EnableSMB2Protocol $true -Force
        $restartRequired = $true
    }
}

# Windows 7, Windows Server 2008 R2, Windows Vista, & Windows Server 2008
if ($majorVersion -eq 6 -and ($minorVersion -eq 1 -or $minorVersion -eq 0)) {
    $smb = Get-Item HKLM:\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters | ForEach-Object { Get-ItemProperty $_.pspath }
    if ($smb.SMB1 -ne $null -and $smb.SMB1 -ne 1) {
        Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters" SMB1 -Type DWORD -Value 1 -Force
        $restartRequired = $true
    }

    if ($smb.SMB2 -ne 1) {
        Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters" SMB2 -Type DWORD -Value 1 -Force
        $restartRequired = $true
    }
}

if ($restartRequired -eq $true) {
    Shutdown /r /f /d P:0:1 /c "System will restart to apply SMB changes."
}
